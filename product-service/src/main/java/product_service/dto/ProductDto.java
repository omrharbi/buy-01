package product_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProductDto {
    private String id;
    private String name;
    private String description;
    private double price;
    private int quantity;
    private String userId;
    private List<String> imageUrls;
}