package com.smartmed.repository;

import com.smartmed.model.Prescription;
import com.smartmed.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByUser(User user);
}
