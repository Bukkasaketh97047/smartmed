package com.smartmed.repository;

import com.smartmed.model.Wallet;
import com.smartmed.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUser(User user);
}
