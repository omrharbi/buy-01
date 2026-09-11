package media_service.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import media_service.events.ImageUploadedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImageEventProducer {

    private final KafkaTemplate<String, ImageUploadedEvent> kafkaTemplate;
    private static final String TOPIC = "image-uploaded-topic";

    public void publishImageUploaded(String productId, String imageUrl) {
        ImageUploadedEvent event = new ImageUploadedEvent(productId, imageUrl);
        kafkaTemplate.send(TOPIC, productId, event);
        log.info("Published IMAGE_UPLOADED event for product {}", productId);
    }
}
