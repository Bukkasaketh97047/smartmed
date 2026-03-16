package com.smartmed.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "prescriptions")
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String uploadPath;
    
    @Column(columnDefinition = "TEXT")
    private String extractedText;
    
    @Column(columnDefinition = "TEXT")
    private String analysisResult;

    private LocalDateTime uploadTime;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
