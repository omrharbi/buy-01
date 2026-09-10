package product_service.client;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MediaClient {

    private final RestClient.Builder restClientBuilder;

    public MediaResponse uploadImage(MultipartFile file, String productId, String userId) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new MultipartFileResource(file));
            body.add("productId", productId);
            body.add("userId", userId);

            MediaResponse response = restClientBuilder.build()
                    .post()
                    .uri("http://media-service/media/images/upload")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(MediaResponse.class);

            if (response == null) {
                throw new IllegalStateException("Media service returned an empty response");
            }
            return response;
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Could not upload image to media-service", exception);
        }
    }

    private static final class MultipartFileResource extends org.springframework.core.io.ByteArrayResource {

        private final String filename;

        private MultipartFileResource(MultipartFile file) {
            super(readBytes(file));
            this.filename = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        }

        private static byte[] readBytes(MultipartFile file) {
            try {
                return file.getBytes();
            } catch (java.io.IOException exception) {
                throw new IllegalStateException("Could not read image file", exception);
            }
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }

    public static class MediaResponse {
        private String id;
        private String url;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }
    }
}