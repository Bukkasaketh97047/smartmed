package com.smartmed.repository;

import com.smartmed.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByNameContainingIgnoreCase(String name);
    List<Medicine> findByActiveIngredientContainingIgnoreCase(String ingredient);
}
