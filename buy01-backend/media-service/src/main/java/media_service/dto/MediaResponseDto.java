package media_service.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MediaResponseDto {
    private String id;
    private String productId;
    private String userId;
    private String contentType;
    private long size;
    private String url;
    private String publicId;
}