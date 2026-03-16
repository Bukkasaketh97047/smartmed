package com.smartmed.controller;

import com.smartmed.model.*;
import com.smartmed.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{username}")
    public ResponseEntity<?> getWallet(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(u -> ResponseEntity.ok(walletRepository.findByUser(u).orElseGet(() -> {
                    Wallet w = new Wallet();
                    w.setUser(u);
                    w.setBalance(250.0); // Initial bonus
                    w.setCoins(1200);
                    return walletRepository.save(w);
                })))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addMoney(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        double amount = Double.parseDouble(payload.get("amount").toString());
        
        return userRepository.findByUsername(username).map(u -> {
            Wallet wallet = walletRepository.findByUser(u).orElseThrow();
            wallet.setBalance(wallet.getBalance() + amount);
            wallet.setCoins(wallet.getCoins() + (int)(amount / 2));
            
            WalletTransaction tx = new WalletTransaction();
            tx.setType("credit");
            tx.setAmount(amount);
            tx.setCoins((int)(amount / 2));
            tx.setDescription("Added via Wallet UPI");
            tx.setDate(LocalDateTime.now());
            tx.setWallet(wallet);
            wallet.getTransactions().add(tx);

            return ResponseEntity.ok(walletRepository.save(wallet));
        }).orElse(ResponseEntity.notFound().build());
    }
}
