package product_service.collections;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;


@Document(collection= "product")
@Data
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private String sellerId;
    private String sellerName;
    private List<String> imageUrls = new ArrayList<>();
    private Instant createdAt;
}
