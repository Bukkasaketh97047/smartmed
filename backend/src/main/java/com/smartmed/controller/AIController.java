package com.smartmed.controller;

import com.smartmed.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping(value = "/analyze-prescription", produces = "application/json")
    public ResponseEntity<Object> analyzePrescription(@RequestParam("file") MultipartFile file) {
        System.out.println("AIController received prescription upload: " + file.getOriginalFilename() + " ("
                + file.getSize() + " bytes)");
        try {
            byte[] bytes = file.getBytes();
            String result = geminiService.analyzePrescription(bytes);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            System.err.println("AIController Error: " + e.getMessage());
            return ResponseEntity.status(500).body("Error reading file: " + e.getMessage());
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody Map<String, String> payload) {
        String message = payload.get("message");
        String result = geminiService.chatWithAugust(message);
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/analyze-symptoms", produces = "application/json")
    public ResponseEntity<Object> analyzeSymptoms(@RequestBody Map<String, List<String>> payload) {
        List<String> symptoms = payload.get("symptoms");
        String result = geminiService.analyzeSymptoms(symptoms);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/check-interactions")
    public ResponseEntity<String> checkInteractions(@RequestBody Map<String, List<String>> payload) {
        List<String> medicines = payload.get("medicines");
        String result = geminiService.checkInteractions(medicines);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/suggest-substitutes")
    public ResponseEntity<String> suggestSubstitutes(@RequestBody Map<String, String> payload) {
        String medicine = payload.get("medicine");
        String result = geminiService.suggestSubstitutes(medicine);
        return ResponseEntity.ok(result);
    }
}
