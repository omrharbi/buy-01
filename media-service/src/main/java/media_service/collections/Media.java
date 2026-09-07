package media_service.collections;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "media")
@Data
public class Media {
    @Id
    private String id;
    private String productId;
    private String userId;
    private String contentType;
    private long size;
    private String publicId;
    private String url; 
}
