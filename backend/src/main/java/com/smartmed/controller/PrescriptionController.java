package com.smartmed.controller;

import com.smartmed.model.Prescription;
import com.smartmed.model.User;
import com.smartmed.repository.PrescriptionRepository;
import com.smartmed.repository.UserRepository;
import com.smartmed.service.PrescriptionScannerService;
import com.smartmed.service.GeminiService;
import com.smartmed.ai.InteractionChecker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/prescription")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    @Autowired
    private PrescriptionScannerService scannerService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InteractionChecker interactionChecker;

    @Value("${upload.path}")
    private String uploadPath;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPrescription(@RequestParam("file") MultipartFile file, @RequestParam("username") String username) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadPath + fileName);
            Files.write(path, file.getBytes());

            Prescription prescription = new Prescription();
            prescription.setFileName(fileName);
            prescription.setUploadPath(uploadPath);
            prescription.setUploadTime(LocalDateTime.now());
            
            userRepository.findByUsername(username).ifPresent(prescription::setUser);

            Prescription saved = prescriptionRepository.save(prescription);
            return ResponseEntity.ok(saved);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    @PostMapping("/scan/{id}")
    public ResponseEntity<?> scanPrescription(@PathVariable Long id) {
        return prescriptionRepository.findById(id).map(p -> {
            String result = scannerService.scanPrescription(p.getFileName());
            p.setAnalysisResult(result);
            prescriptionRepository.save(p);
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<?> getUserPrescriptions(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(u -> ResponseEntity.ok(prescriptionRepository.findByUser(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/check-interactions")
    public ResponseEntity<List<String>> checkInteractions(@RequestBody List<String> medicineNames) {
        List<String> alerts = interactionChecker.checkInteractions(medicineNames);
        return ResponseEntity.ok(alerts);
    }

    @PostMapping("/generate-summary")
    public ResponseEntity<String> summarizePrescription(@RequestBody List<String> medicineNames) {
        String summary = geminiService.generatePrescriptionSummary(medicineNames);
        return ResponseEntity.ok(summary);
    }
}
