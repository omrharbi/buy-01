package product_service.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class ProductDto {
    private String id;
    private String name;
    private String description;
    private double price;
    private int quantity;
    private String sellerId;
    private String sellerName;
    private List<String> imageUrls;
    private Instant createdAt;
}
