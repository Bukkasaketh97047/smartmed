package com.smartmed.controller;

import com.smartmed.model.Reminder;
import com.smartmed.repository.ReminderRepository;
import com.smartmed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "*")
public class ReminderController {

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{username}")
    public ResponseEntity<List<Reminder>> getReminders(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(u -> ResponseEntity.ok(reminderRepository.findByUser(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Reminder> addReminder(@RequestBody Reminder reminder, @RequestParam String username) {
        return userRepository.findByUsername(username).map(u -> {
            reminder.setUser(u);
            return ResponseEntity.ok(reminderRepository.save(reminder));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReminder(@PathVariable Long id) {
        if (id != null) {
            reminderRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}
