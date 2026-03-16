package com.smartmed.repository;

import com.smartmed.model.Reminder;
import com.smartmed.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUser(User user);
}
