package product_service.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import product_service.Exception.ProductNotFoundException;
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
            log.warn("Ignoring invalid image event");
            return;
        }
        try {
            if ("REMOVE".equalsIgnoreCase(event.getEventType())) {
                productService.removeImageUrl(event.getProductId(), event.getImageUrl());
            } else {
                productService.addImageUrl(event.getProductId(), event.getImageUrl());
            }
        } catch (ProductNotFoundException e) {
            log.warn("Ignoring image event for missing product {}", event.getProductId());
        }
    }
}
