package media_service.collections;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "media")
@Data
public class Media {
    @Id
    private String id;
    /** Null until the image is attached to a product. */
    private String productId;
    private String ownerId;
    private String fileName;
    private String contentType;
    private long size;
    private String publicId;
    private String url;
    private Instant uploadedAt;
}
