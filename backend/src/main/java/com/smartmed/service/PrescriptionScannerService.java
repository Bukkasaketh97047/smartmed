package com.smartmed.service;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.opencv.core.*;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import nu.pattern.OpenCV;
import com.smartmed.repository.ProductRepository;
import com.smartmed.ai.DosageValidator;
import com.smartmed.ai.InteractionChecker;
import org.springframework.beans.factory.annotation.Autowired;
import org.apache.commons.text.similarity.LevenshteinDistance;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PrescriptionScannerService {

    @Value("${tesseract.datapath}")
    private String tessDataPath;

    @Value("${upload.path}")
    private String uploadPath;

    @Value("${tesseract.language}")
    private String language;

    private final GeminiService geminiService;

    public PrescriptionScannerService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostConstruct
    public void init() {
        OpenCV.loadShared();
        try {
            Files.createDirectories(Paths.get(uploadPath));
        } catch (IOException e) {
            System.err.println("Could not create upload directory: " + e.getMessage());
        }
    }

    public String scanPrescription(String fileName) {
        String filePath = uploadPath + fileName;
        String processedPath = uploadPath + "proc_" + fileName;

        // 1. Image Preprocessing
        preprocessImage(filePath, processedPath);

        // 2. OCR
        String extractedText = performOCR(processedPath);
        System.out.println("=== OCR TEXT ===");
        System.out.println(extractedText);

        // If OCR failed completely, try raw image
        if (extractedText == null || extractedText.trim().isEmpty()) {
            extractedText = performOCR(filePath); // try original if preprocessed failed
        }

        // 3. LOCAL DATABASE MATCHING - PRIMARY PATH (always run this first!)
        // This guarantees all medicines in the database are always detected.
        String localResult = null;
        if (extractedText != null && !extractedText.trim().isEmpty()) {
            localResult = extractMedicinesLocally(extractedText);
            System.out.println("Local matcher result: " + localResult);
        }

        // 4. Try AI to get enriched results (dosage, frequency) on top of local match
        // If AI works, merge it with local; if not, just use local.
        try {
            byte[] imageBytes = Files.readAllBytes(Paths.get(filePath));
            String aiResult = geminiService.analyzePrescription(imageBytes);
            System.out.println("AI result: " + aiResult);

            boolean aiSuccess = aiResult != null && !aiResult.contains("\"error\"") 
                                && !aiResult.trim().equals("[]") && !aiResult.isBlank();
            
            if (aiSuccess) {
                // AI succeeded — merge with local (local catches what AI missed)
                if (localResult != null) {
                    return mergeResults(aiResult, localResult);
                }
                return aiResult;
            }
        } catch (Exception e) {
            System.err.println("AI enrichment failed (non-critical): " + e.getMessage());
        }

        // 5. AI failed or returned nothing — use local result
        if (localResult != null) {
            return localResult;
        }

        // 6. Nothing matched — show raw OCR fallback
        String rawText = extractedText != null ? extractedText.replaceAll("[\"\\n\\r\\\\]", " ").trim() : "Unable to read text from image.";
        return "[{\"isFallback\": true, \"name\": \"No Medicines Detected\", \"rawText\": \"" + rawText + "\", \"warning\": \"Could not identify medicines. See raw OCR text below.\"}]";
    }

    /**
     * Merges AI-detected medicines with locally-detected medicines.
     * Adds local matches only if not already present in AI results (by brand name).
     */
    private String mergeResults(String aiJson, String localJson) {
        if (aiJson == null || aiJson.isBlank() || aiJson.trim().equals("[]")) return localJson;
        if (localJson == null || localJson.isBlank() || localJson.trim().equals("[]")) return aiJson;
        
        System.out.println("Merging AI results with local matches...");
        
        // Extract all existing names from AI result for duplicate check
        java.util.Set<String> aiSkeletons = new java.util.HashSet<>();
        java.util.regex.Pattern namePattern = java.util.regex.Pattern.compile("\"name\"\\s*:\\s*\"([^\"]+)\"");
        java.util.regex.Matcher aiMatcher = namePattern.matcher(aiJson);
        while (aiMatcher.find()) {
            String name = aiMatcher.group(1).toLowerCase();
            // Use skeleton (no spaces/special chars) for robust duplicate check
            aiSkeletons.add(name.replaceAll("[^a-z0-9]", ""));
            // Also add the first word as a skeleton
            aiSkeletons.add(name.split("[^a-z0-9]+")[0]);
        }
        
        // Extract local items and add those not already in AI results
        List<String> toAdd = new ArrayList<>();
        java.util.regex.Pattern itemPattern = java.util.regex.Pattern.compile("\\{[^}]+\\}");
        java.util.regex.Matcher itemMatcher = itemPattern.matcher(localJson);
        
        while (itemMatcher.find()) {
            String item = itemMatcher.group(0);
            java.util.regex.Matcher nm = namePattern.matcher(item);
            if (nm.find()) {
                String localName = nm.group(1).toLowerCase();
                String localSkeleton = localName.replaceAll("[^a-z0-9]", "");
                String localBrand = localName.split("[^a-z0-9]+")[0];
                
                if (!aiSkeletons.contains(localSkeleton) && !aiSkeletons.contains(localBrand)) {
                    // This medicine was missed by AI — add it with a note
                    String enrichedItem = item.replace("\"warning\": \"", "\"warning\": \"[AI Missed] ");
                    toAdd.add(enrichedItem);
                    System.out.println("Enriching results with missed medicine: " + nm.group(1));
                    // Add to skeletons to prevent adding same local twice if multiple matches
                    aiSkeletons.add(localSkeleton);
                }
            }
        }
        
        if (toAdd.isEmpty()) {
            System.out.println("No missing medicines found in local matches.");
            return aiJson;
        }
        
        // Append new local items to AI JSON array
        String trimmed = aiJson.trim();
        if (trimmed.endsWith("]")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1).trim(); // remove trailing ]
        }
        
        String result = trimmed + (trimmed.length() > 1 ? ", " : "") + String.join(", ", toAdd) + "]";
        System.out.println("Merge complete. Final item count: " + (aiSkeletons.size() / 2 + toAdd.size())); // rough estimate
        return result;
    }

    private String extractMedicinesLocally(String ocrText) {
        if (ocrText == null || ocrText.isEmpty()) return null;
        
        System.out.println("--- Starting Local Matcher ---");
        // Clean and normalize OCR text for multiple matching strategies
        String normalizedOcr = ocrText.toLowerCase();
        // Skeleton OCR: only alphanumeric, no spaces (handles "10mg" vs "10 mg")
        String skeletonOcr = normalizedOcr.replaceAll("[^a-z0-9]", "");
        
        List<com.smartmed.model.Product> allProducts = productRepository.findAll();
        List<Map<String, String>> matchedMedicines = new ArrayList<>();
        LevenshteinDistance fuzzy = new LevenshteinDistance();
        
        System.out.println("Checking " + allProducts.size() + " products against OCR text...");

        for (com.smartmed.model.Product product : allProducts) {
            String originalName = product.getName();
            String fullNameLc = originalName.toLowerCase();
            String skeletonName = fullNameLc.replaceAll("[^a-z0-9]", "");
            
            boolean matched = false;
            String matchMethod = "";

            // Strategy 1: Skeleton Match (Very robust against spaces/dashes/dots)
            if (skeletonName.length() >= 4 && skeletonOcr.contains(skeletonName)) {
                matched = true;
                matchMethod = "Skeleton Match";
            } 
            
            // Strategy 2: Word-Bag Match (Checks if all significant words are present)
            if (!matched) {
                String[] nameParts = fullNameLc.split("[^a-z0-9]+");
                boolean allPartsFound = true;
                int significantParts = 0;
                
                for (String part : nameParts) {
                    if (part.length() < 2) continue; // skip single letters
                    significantParts++;
                    if (!normalizedOcr.contains(part)) {
                        allPartsFound = false;
                        break;
                    }
                }
                
                if (significantParts > 0 && allPartsFound) {
                    matched = true;
                    matchMethod = "Word-Bag Match";
                }
            }

            // Strategy 3: Fuzzy Match on Brand Name (First Word)
            if (!matched) {
                String brandName = fullNameLc.split("[^a-z0-9]+")[0];
                if (brandName.length() >= 5) {
                    // Split OCR into words for fuzzy comparison
                    String[] ocrWords = normalizedOcr.split("[^a-z0-9]+");
                    for (String ocrWord : ocrWords) {
                        if (ocrWord.length() >= 4 && fuzzy.apply(ocrWord, brandName) <= 1) {
                            matched = true;
                            matchMethod = "Fuzzy Match (" + ocrWord + " -> " + brandName + ")";
                            break;
                        }
                    }
                }
            }

            if (matched) {
                System.out.println("✅ MATCH FOUND: '" + originalName + "' via " + matchMethod);
                
                // Avoid duplicates by brand name
                String brandPrefix = product.getName().split("[\\s-]+")[0].toLowerCase();
                boolean exists = matchedMedicines.stream()
                        .anyMatch(m -> m.get("name").toLowerCase().startsWith(brandPrefix));

                if (!exists) {
                    Map<String, String> med = new java.util.HashMap<>();
                    med.put("name", product.getName());
                    med.put("dosage", "Check Database");
                    med.put("frequency", "See Instructions");
                    med.put("duration", "N/A");
                    med.put("warning", "Extracted via Local Match (" + matchMethod + ")");
                    matchedMedicines.add(med);
                }
            }
        }
        
        System.out.println("Local matcher finished. Total items found: " + matchedMedicines.size());
        if (matchedMedicines.isEmpty()) return null;
        
        // Convert to JSON array string
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < matchedMedicines.size(); i++) {
            Map<String, String> med = matchedMedicines.get(i);
            json.append("{")
                .append("\"name\": \"").append(med.get("name")).append("\", ")
                .append("\"dosage\": \"").append(med.get("dosage")).append("\", ")
                .append("\"frequency\": \"").append(med.get("frequency")).append("\", ")
                .append("\"duration\": \"").append(med.get("duration")).append("\", ")
                .append("\"warning\": \"").append(med.get("warning")).append("\"")
                .append("}");
            if (i < matchedMedicines.size() - 1) json.append(", ");
        }
        json.append("]");
        return json.toString();
    }

    private void preprocessImage(String inputPath, String outputPath) {
        Mat src = Imgcodecs.imread(inputPath);
        if (src.empty()) return;

        // 1. Upscale image by 2x to help with small/handwritten text
        Mat upscaled = new Mat();
        Imgproc.resize(src, upscaled, new Size(src.width() * 2, src.height() * 2));

        Mat gray = new Mat();
        Imgproc.cvtColor(upscaled, gray, Imgproc.COLOR_BGR2GRAY);

        // 2. Subtle Blur (3x3 is less aggressive and preserves more detail)
        Mat blurred = new Mat();
        Imgproc.GaussianBlur(gray, blurred, new Size(3, 3), 0);
        
        // 3. Threshold (Otsu's Thresholding for optimal binary conversion)
        Mat thresholded = new Mat();
        Imgproc.threshold(blurred, thresholded, 0, 255, Imgproc.THRESH_BINARY + Imgproc.THRESH_OTSU);

        // 4. Polarity Check: Tesseract expects black text on white background.
        // If the mean is low (mostly black), invert the image.
        Scalar mean = Core.mean(thresholded);
        if (mean.val[0] < 127) {
            System.out.println("Low brightness detected in processed image. Inverting polarity for OCR...");
            Core.bitwise_not(thresholded, thresholded);
        }

        Imgcodecs.imwrite(outputPath, thresholded);
    }

    private String performOCR(String imagePath) {
        ITesseract tesseract = new Tesseract();
        tesseract.setDatapath(tessDataPath);
        tesseract.setLanguage(language);
        
        // --- UPDATED: Set PSM 4 (Assume a single column of text of variable sizes) ---
        // This is better for prescriptions with multiple lines.
        tesseract.setPageSegMode(4);
        tesseract.setOcrEngineMode(1);

        try {
            return tesseract.doOCR(new File(imagePath));
        } catch (TesseractException e) {
            System.err.println("OCR Error: " + e.getMessage());
            return null;
        }
    }

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DosageValidator dosageValidator;

    @Autowired
    private InteractionChecker interactionChecker;

    private String parseWithAI(String rawText) {
        // Use Gemini to parse the structural details from the OCR text
        String prompt = "Extract medical details from this prescription text: " + rawText + 
                ". Return a JSON array of objects with keys: name, dosage, frequency, duration. " +
                "Also include a 'warning' key if dosage is unusual. Return ONLY raw JSON.";
        
        String analysis = geminiService.chatWithAugust(prompt);
        // We could further enrich this here with DB matching
        return analysis;
    }
}
