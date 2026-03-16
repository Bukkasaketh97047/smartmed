package com.smartmed.model;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String username;
    private List<OrderItemRequest> items;
    private Double totalAmount;
    private String shippingAddress;

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
        private Double price;
    }
}
