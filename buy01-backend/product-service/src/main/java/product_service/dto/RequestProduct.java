package product_service.dto;

import lombok.Data;

import java.util.List;

@Data
public class RequestProduct {
    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private List<String> imageUrls;
}
