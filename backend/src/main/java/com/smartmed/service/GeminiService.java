package com.smartmed.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${google.gemini.api.key}")
    private String apiKey;

    private final WebClient webClient;

    public GeminiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public String analyzePrescription(byte[] imageBytes) {
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);

        String prompt = "You are a medical prescription analyzer. Read the uploaded prescription image carefully. " +
                "Extract: 1. Medicine names, 2. Dosage (mg/ml), 3. Instructions, 4. Medical products. " +
                "Return the results as a JSON array of objects with these keys: " +
                "name, dosage, type, instructions, frequency, duration, originalText. " +
                "Return ONLY a raw JSON array. Example: [{\"name\": \"Paracetamol\", \"dosage\": \"500mg\", \"type\": \"Tablet\", \"instructions\": \"After lunch\", \"frequency\": \"1-0-1\", \"duration\": \"5 days\", \"originalText\": \"Para 500\"}]";

        System.out.println("Processing Direct Vision Handwriting Translation...");
        return callGemini(prompt, base64Image, "image/jpeg");
    }

    public String chatWithAugust(String userMessage) {
        String prompt = "You are August AI, a highly advanced medical and mental health companion for the SmartMed platform. " +
                "Goal: Help users understand their symptoms and provide general guidance. " +
                "Rules:\n" +
                "1. If a user describes symptoms like fever, headache, or pain, suggest common over-the-counter (OTC) medicines (e.g., Paracetamol, Ibuprofen, Cetirizine) and explain what they help with.\n" +
                "2. ALWAYS include a disclaimer: 'I am an AI, not a doctor. Consult a professional for severe symptoms.'\n" +
                "3. Use a caring, professional, and helpful tone.\n" +
                "4. Keep responses concise (2-4 sentences).\n" +
                "5. If it's a mental health query (mode 'August Mind'), focus on empathy, validation, and relaxation techniques.\n" +
                "6. Format your response clearly with bolding for medicine names.\n" +
                "User says: " + userMessage;

        return callGemini(prompt, null, null);
    }

    public String analyzeSymptoms(List<String> symptoms) {
        String prompt = "Act as an AI medical assistant for the SmartMed project. Analyze these symptoms: " + String.join(", ", symptoms) + ".\n\n" +
                "Return a JSON object with strictly these keys:\n" +
                "1. 'condition': The likely general condition (not a medical diagnosis).\n" +
                "2. 'description': A short, patient-friendly explanation of why these symptoms occur.\n" +
                "3. 'recommendations': A JSON array of 2-3 common over-the-counter medicine names (e.g., ['Paracetamol', 'Dolo 650', 'Cetirizine']) that might help.\n\n" +
                "Return ONLY the raw JSON object. Use valid JSON format.";
        return callGemini(prompt, null, null);
    }

    public String checkInteractions(List<String> medicines) {
        String prompt = "Act as a clinical pharmacist. Check for drug-drug interactions between these medicines: " +
                String.join(", ", medicines) +
                ". If there are risks, list them clearly with severity (High/Medium/Low). If safe, say 'No significant interactions found'. Return as a clean text list.";
        return callGemini(prompt, null, null);
    }

    public String suggestSubstitutes(String medicine) {
        String prompt = "Suggest 3 generic or branded substitutes for '" + medicine +
                "'. List only the names and a reason for the substitute (e.g., costs less, same active ingredient). Return as a clean text list.";
        return callGemini(prompt, null, null);
    }

    public String generatePrescriptionSummary(List<String> medicines) {
        String medicineListStr = String.join("\n", medicines);
        String prompt = "You are an AI Pharmacy Assistant integrated into the SmartMed Pharmacy System. Your task is to analyze medicines detected from a prescription and explain them clearly for patients.\n\n" +
                "GOAL: Generate a patient-friendly prescription explanation that helps users understand: what each medicine is for, how it is usually taken, possible side effects, safety advice, and potential interactions.\n\n" +
                "IMPORTANT RULES:\n" +
                "- Do NOT diagnose diseases.\n" +
                "- Do NOT give exact medical prescriptions.\n" +
                "- Only provide general educational information.\n" +
                "- Use simple language that non-medical users can understand.\n" +
                "- Keep explanations concise and clear.\n\n" +
                "INPUT MEDICINES:\n" + medicineListStr + "\n\n" +
                "OUTPUT FORMAT:\n" +
                "SMARTMED AI PRESCRIPTION SUMMARY\n\n" +
                "Detected Medicines:\n" +
                "[List medicines]\n\n" +
                "MEDICINE DETAILS\n" +
                "Medicine: [Name]\n" +
                "Purpose: [Briefly explain]\n" +
                "Usage Guidance: [General pattern, e.g., after food]\n" +
                "Common Side Effects: [Short list]\n" +
                "Safety Advice: [Precautions]\n\n" +
                "(Repeat for each medicine)\n\n" +
                "DOSAGE INTERPRETATION\n" +
                "Explain strengths (e.g., 500mg) in simple terms.\n\n" +
                "INTERACTION CHECK\n" +
                "If risks exist, list them; else say 'No major common interactions detected.'\n\n" +
                "PATIENT INSTRUCTIONS\n" +
                "- [Simple steps like drink water, take as advised]\n\n" +
                "Disclaimer: Educational information only. Always follow doctor's instructions.";

        return callGemini(prompt, null, null);
    }

    private String callGemini(String prompt, String base64Image, String mimeType) {
        // Use gemini-1.5-flash as the primary model (widely available and best for handwriting)
        String result = callGeminiWithRetry(prompt, base64Image, mimeType, "v1", "gemini-1.5-flash", 0);

        // Fallback to gemini-2.0-flash if 1.5-flash is unavailable (though 1.5 is more stable)
        if (result.equals("ERROR_RATE_LIMIT") || result.equals("ERROR_QUOTA_EXCEEDED")
                || result.equals("ERROR_MODEL_NOT_FOUND")) {
            System.out.println("Switching to alternative model (gemini-2.0-flash) due to: " + result);
            result = callGeminiWithRetry(prompt, base64Image, mimeType, "v1beta", "gemini-2.0-flash", 0);
        }
        
        if (result != null && result.startsWith("ERROR_")) {
            return "{\"error\": \"AI Service Unavailable: " + result + ". Please try again in 30 seconds.\"}";
        }
        
        return result;
    }

    private String callGeminiWithRetry(String prompt, String base64Image, String mimeType, String version, String model,
            int retryCount) {
        String result = callGeminiEndpoint(prompt, base64Image, mimeType, version, model);

        // Robust Rate Limit Handling with Exponential Backoff (including internal response errors)
        if ((result.equals("ERROR_RATE_LIMIT") || result.equals("ERROR_IN_RESPONSE")) && retryCount < 3) {
            long delay = (retryCount == 0) ? 5000 : (retryCount == 1) ? 10000 : 20000; 
            System.out.println("Gemini Rate Limit or Error on " + model + ". Retrying (" + (retryCount + 1) + "/3) after "
                    + (delay / 1000) + "s...");
            try {
                Thread.sleep(delay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            return callGeminiWithRetry(prompt, base64Image, mimeType, version, model, retryCount + 1);
        }

        return result;
    }

    private String callGeminiEndpoint(String prompt, String base64Image, String mimeType, String version,
            String model) {
        List<Map<String, Object>> parts = new java.util.ArrayList<>();
        parts.add(Map.of("text", prompt));

        if (base64Image != null) {
            parts.add(Map.of("inline_data", Map.of(
                    "mime_type", mimeType != null ? mimeType : "image/jpeg",
                    "data", base64Image)));
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", parts)));

        try {
            System.out.println("Calling Gemini API (" + model + ") " + version + " - Attempting extraction...");

            return webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/" + version + "/models/" + model + ":generateContent")
                            .queryParam("key", apiKey)
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.isError(), response -> {
                        return response.bodyToMono(String.class).map(body -> {
                            System.err.println("Gemini API Error [" + response.statusCode() + "]: " + body);
                            return new RuntimeException("API_ERROR_" + response.statusCode().value() + ":" + body);
                        });
                    })
                    .bodyToMono(Map.class)
                    .map(response -> parseResponse(response))
                    .block();
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            System.err.println("Gemini Service Exception: " + msg);

            if (msg.contains("429"))
                return "ERROR_RATE_LIMIT";
            if (msg.contains("403"))
                return "ERROR_QUOTA_EXCEEDED";
            if (msg.contains("404"))
                return "ERROR_MODEL_NOT_FOUND";
            if (msg.contains("500"))
                return "ERROR_SERVER";

            return "[]";
        }
    }

    private String parseResponse(Map<String, Object> response) {
        System.out.println("---------- GEMINI RAW RESPONSE ----------");
        System.out.println(response);
        System.out.println("-----------------------------------------");

        if (response == null || !response.containsKey("candidates")) {
            System.err.println("Gemini Error: No 'candidates' found in response.");
            return "[]";
        }

        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            System.err.println("Gemini Error: 'candidates' array is empty.");
            return "[]";
        }

        // Deep dive into safety blocks if content is blocked
        Map<String, Object> candidate0 = candidates.get(0);
        if (candidate0.containsKey("finishReason") && "SAFETY".equals(candidate0.get("finishReason"))) {
            System.err.println("Gemini Error: Request blocked by SAFETY filters.");
            return "ERROR_IN_RESPONSE";
        }

        if (!candidate0.containsKey("content")) {
            System.err.println("Gemini Error: 'content' node is missing. " + candidate0.toString());
            return "ERROR_IN_RESPONSE";
        }

        Map<String, Object> content = (Map<String, Object>) candidate0.get("content");
        List<Map<String, Object>> contentParts = (List<Map<String, Object>>) content.get("parts");
        if (contentParts == null || contentParts.isEmpty() || !contentParts.get(0).containsKey("text")) {
            System.err.println("Gemini Error: 'parts' array or 'text' node is missing.");
            return "ERROR_IN_RESPONSE";
        }

        String text = (String) contentParts.get(0).get("text");

        System.out.println("EXTRACTED AI TEXT RAW: " + text);

        // Validation: Never treat error keywords as medicine
        String upperText = text.toUpperCase();
        if (upperText.contains("ERROR_RATE_LIMIT") || upperText.contains("ERROR_QUOTA") ||
                upperText.contains("RESOURCE_EXHAUSTED") || upperText.contains("RATE_LIMIT")) {
            System.err.println("Gemini returned an embedded error message.");
            return "ERROR_IN_RESPONSE";
        }

        String cleaned = text.trim();
        if (cleaned.contains("```")) {
            cleaned = cleaned.replaceAll("(?s).*?```(?:json)?\\s*(.*?)\\s*```.*", "$1");
        }

        if (cleaned.contains("{") && cleaned.contains("}")) {
            int start = cleaned.indexOf("{");
            int end = cleaned.lastIndexOf("}") + 1;
            cleaned = cleaned.substring(start, end);
        } else if (cleaned.contains("[") && cleaned.contains("]")) {
            int start = cleaned.indexOf("[");
            int end = cleaned.lastIndexOf("]") + 1;
            cleaned = cleaned.substring(start, end);
        }
        return cleaned.trim();
    }
}
