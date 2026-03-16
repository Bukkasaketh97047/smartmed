package com.smartmed.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "medicines")
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String brand;
    private String manufacturer;
    private double price;
    private int stock;
    private String activeIngredient;
    
    @Column(columnDefinition = "TEXT")
    private String description;
}
