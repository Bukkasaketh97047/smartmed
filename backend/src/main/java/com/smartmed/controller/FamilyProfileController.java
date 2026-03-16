package com.smartmed.controller;

import com.smartmed.model.FamilyProfile;
import com.smartmed.model.User;
import com.smartmed.repository.FamilyProfileRepository;
import com.smartmed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/family")
@CrossOrigin(origins = "*")
public class FamilyProfileController {

    @Autowired
    private FamilyProfileRepository familyProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{username}")
    public ResponseEntity<List<FamilyProfile>> getProfiles(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(u -> ResponseEntity.ok(familyProfileRepository.findByUser(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FamilyProfile> addProfile(@RequestBody FamilyProfile profile, @RequestParam String username) {
        return userRepository.findByUsername(username).map(u -> {
            profile.setUser(u);
            return ResponseEntity.ok(familyProfileRepository.save(profile));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProfile(@PathVariable Long id) {
        familyProfileRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
