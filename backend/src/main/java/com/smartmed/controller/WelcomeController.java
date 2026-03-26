package com.smartmed.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WelcomeController {
    
    @GetMapping("/")
    public String welcome() {
        return "SmartMed Backend is LIVE!";
    }

    @GetMapping("/health")
    public String health() {
        return "UP";
    }
}
