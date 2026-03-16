package com.smartmed.repository;

import com.smartmed.model.FamilyProfile;
import com.smartmed.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FamilyProfileRepository extends JpaRepository<FamilyProfile, Long> {
    List<FamilyProfile> findByUser(User user);
}
