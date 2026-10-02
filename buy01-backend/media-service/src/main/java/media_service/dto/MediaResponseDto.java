package media_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MediaResponseDto {
    private String id;
    private String productId;
    private String ownerId;
    private String fileName;
    private String contentType;
    private long size;
    private String url;
    private String publicId;
    private Instant uploadedAt;
}
