package com.smartmed.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "wallet_transactions")
public class WalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // credit, debit
    private double amount;
    private int coins;
    private String description;
    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;
}
