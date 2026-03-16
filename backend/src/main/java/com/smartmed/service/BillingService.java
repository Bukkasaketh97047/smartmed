package com.smartmed.service;

import com.smartmed.model.Product;
import com.smartmed.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BillingService {

    @Autowired
    private ProductRepository productRepository;

    public Map<String, Object> generateBill(List<Map<String, Object>> selectedMedicines) {
        double subtotal = 0;
        List<Map<String, Object>> billItems = new ArrayList<>();

        for (Map<String, Object> item : selectedMedicines) {
            String name = (String) item.get("name");
            int quantity = (int) item.getOrDefault("quantity", 1);

            Product product = productRepository.findByNameContainingIgnoreCase(name).stream().findFirst().orElse(null);
            
            double price = (product != null) ? product.getPrice() : 50.0; // Default price if not found
            double total = price * quantity;
            subtotal += total;

            Map<String, Object> billItem = new HashMap<>();
            billItem.put("id", (product != null) ? product.getId() : System.currentTimeMillis());
            billItem.put("name", name);
            billItem.put("quantity", quantity);
            billItem.put("price", price);
            billItem.put("total", total);
            billItem.put("imageUrl", (product != null) ? product.getImageUrl() : null);
            billItems.add(billItem);
        }

        double tax = subtotal * 0.05; // 5% tax
        double finalTotal = subtotal + tax;

        Map<String, Object> bill = new HashMap<>();
        bill.put("items", billItems);
        bill.put("subtotal", subtotal);
        bill.put("tax", tax);
        bill.put("finalTotal", finalTotal);
        bill.put("billId", "INV-" + System.currentTimeMillis());

        return bill;
    }
}
