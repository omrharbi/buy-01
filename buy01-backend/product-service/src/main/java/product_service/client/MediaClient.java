
package product_service.client;

import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import product_service.dto.MediaInfo;

public class MediaClient {
    private final RestClient restClient;

    public MediaClient(RestClient.Builder builder, String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }
    public MediaInfo upload(MultipartFile file, String productId, String userId) {
        MultipartBodyBuilder body = new MultipartBodyBuilder();
        body.part("file", file.getResource());
        if (productId != null) {
            body.part("productId", productId);
        }

        return restClient.post()
                .uri("/api/media/images/upload")
                .header("Authorization", "Bearer " + userId)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body.build())
                .retrieve()
                .body(MediaInfo.class);
    }

    public void delete(String mediaId, String userId) {
        restClient.delete()
                .uri("/api/media/images/{id}", mediaId)
                .header("Authorization", "Bearer " + userId)
                .retrieve()
                .toBodilessEntity();
    }
}
