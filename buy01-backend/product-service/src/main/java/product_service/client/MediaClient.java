
package product_service.client;

import org.springframework.web.client.RestClient;

public class MediaClient {
    private final RestClient restClient;

    public MediaClient(RestClient.Builder builder, String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }
}
