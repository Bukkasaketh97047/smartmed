package com.smartmed.controller;

import com.smartmed.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bill")
@CrossOrigin(origins = "*")
public class BillController {

    @Autowired
    private BillingService billingService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateBill(@RequestBody List<Map<String, Object>> selectedMedicines) {
        return ResponseEntity.ok(billingService.generateBill(selectedMedicines));
    }
}
