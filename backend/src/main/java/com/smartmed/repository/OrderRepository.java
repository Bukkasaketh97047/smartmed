package com.smartmed.repository;

import com.smartmed.model.Order;
import com.smartmed.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);

    List<Order> findByUser_Username(String username);
}
