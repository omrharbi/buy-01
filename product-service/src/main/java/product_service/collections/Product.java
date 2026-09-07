package product_service.collections;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;


@Document(collection= "product")
@Data
public class Product {
    @Id
    String id;
    String name;
    String description;
    Double price;
    int quantity;
    String UserId;
    List<String> imageUrls = new ArrayList<>();
}