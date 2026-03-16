package com.smartmed.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "reminders")
public class Reminder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String medicineName;
    private String time;
    private String frequency;
    private String forPerson;
    private boolean active;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
