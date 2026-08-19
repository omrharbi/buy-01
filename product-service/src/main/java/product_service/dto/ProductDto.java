package product_service.dto;

import lombok.Data;

@Data
public class ProductDto {

    private String id;
    private String name;
    private String description;
    private double price;
    private int quantity;
    private String userId;

    
}