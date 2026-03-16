package com.smartmed.controller;

import com.smartmed.model.*;
import com.smartmed.repository.OrderRepository;
import com.smartmed.repository.ProductRepository;
import com.smartmed.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        System.out.println("Processing order for user: " + orderRequest.getUsername());
        return userRepository.findByUsername(orderRequest.getUsername())
                .<ResponseEntity<?>>map(user -> {
                    System.out.println("Found user: " + user.getId());
                    Order order = new Order();
                    order.setUser(user);
                    order.setTotalAmount(orderRequest.getTotalAmount());
                    order.setShippingAddress(orderRequest.getShippingAddress());
                    order.setStatus("PENDING");

                    List<OrderItem> items = orderRequest.getItems().stream().map(itemRequest -> {
                        Product product = productRepository.findById(itemRequest.getProductId())
                                .orElseThrow(
                                        () -> new RuntimeException("Product not found: " + itemRequest.getProductId()));
                        System.out.println("Adding product: " + product.getName() + " x" + itemRequest.getQuantity());

                        OrderItem orderItem = new OrderItem();
                        orderItem.setOrder(order);
                        orderItem.setProduct(product);
                        orderItem.setQuantity(itemRequest.getQuantity());
                        orderItem.setPrice(itemRequest.getPrice());
                        return orderItem;
                    }).collect(Collectors.toList());

                    order.setItems(items);
                    Order savedOrder = orderRepository.save(order);
                    System.out.println("Order saved successfully: " + savedOrder.getId());
                    return ResponseEntity.ok((Object) savedOrder);
                })
                .orElseGet(() -> {
                    System.out.println("User not found: " + orderRequest.getUsername());
                    return ResponseEntity.badRequest().body((Object) ("User not found: " + orderRequest.getUsername()));
                });
    }

    @GetMapping("/user/{username}")
    public List<Order> getUserOrders(@PathVariable String username) {
        return orderRepository.findByUser_Username(username);
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody String status) {
        return orderRepository.findById(id)
                .map(order -> {
                    order.setStatus(status.replace("\"", "")); // Remove quotes if sent as plain string
                    orderRepository.save(order);
                    return ResponseEntity.ok(order);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
