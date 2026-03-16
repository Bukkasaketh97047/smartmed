package com.smartmed.controller;

import com.smartmed.config.JwtProvider;
import com.smartmed.model.User;
import com.smartmed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @GetMapping("/test")
    public String test() {
        System.out.println("Test endpoint reached!");
        return "Backend is reachable!";
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        System.out.println("Received registration request for: " + user.getEmail());
        if (userRepository.existsByUsername(user.getUsername())) {
            System.out.println("Registration failed: Username exists");
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            System.out.println("Registration failed: Email exists");
            return ResponseEntity.badRequest().body("Email already registered");
        }
        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("ROLE_USER");
            }
            User savedUser = userRepository.save(user);
            System.out.println("Registration successful for: " + user.getEmail());

            String token = jwtProvider.generateToken(savedUser.getUsername());
            return ResponseEntity.ok(Map.of(
                    "message", "User registered and logged in successfully",
                    "token", token,
                    "username", savedUser.getUsername(),
                    "role", savedUser.getRole()));
        } catch (Exception e) {
            System.out.println("Registration failed: " + e.getMessage());
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");
        System.out.println("Login attempt for user: " + username);

        return userRepository.findByUsername(username)
                .map(user -> {
                    if (passwordEncoder.matches(password, user.getPassword())) {
                        System.out.println("Login successful for user: " + username);
                        String token = jwtProvider.generateToken(username);
                        return ResponseEntity.ok(Map.of(
                                "message", "Login successful",
                                "username", username,
                                "token", token,
                                "role", user.getRole()));
                    }
                    System.out.println("Login failed: Invalid password for user: " + username);
                    return ResponseEntity.status(401).body("Invalid credentials");
                })
                .orElseGet(() -> {
                    System.out.println("Login failed: User not found: " + username);
                    return ResponseEntity.status(401).body("User not found: " + username);
                });
    }
}
