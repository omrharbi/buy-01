package product_service.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageUploadedEvent {
    private String productId;
    private String imageUrl;
    private String eventType = "UPLOAD";

    public ImageUploadedEvent(String productId, String imageUrl) {
        this.productId = productId;
        this.imageUrl = imageUrl;
        this.eventType = "UPLOAD";
    }
}
