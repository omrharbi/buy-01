package product_service.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import product_service.events.ImageUploadedEvent;
import product_service.services.ProductService;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImageUploadedConsumer {

    private final ProductService productService;

    @KafkaListener(topics = "image-uploaded-topic", groupId = "product-service-group")
    public void handleImageUploaded(ImageUploadedEvent event) {
        if (event == null || event.getProductId() == null || event.getImageUrl() == null) {
            log.warn("Ignoring invalid image uploaded event");
            return;
        }
        productService.addImageUrl(event.getProductId(), event.getImageUrl());
    }
}
