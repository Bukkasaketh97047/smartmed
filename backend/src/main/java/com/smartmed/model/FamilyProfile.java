package com.smartmed.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "family_profiles")
public class FamilyProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String relation;
    private int age;
    private String color;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
