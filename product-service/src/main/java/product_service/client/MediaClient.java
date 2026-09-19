package product_service.client;

import java.io.IOException;
import java.util.Map;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;
import product_service.Exception.MediaServiceException;

@Slf4j
@Component
public class MediaClient {

    private static final String MEDIA_SERVICE_ID = "MEDIA-SERVICE";

    public record MediaInfo(String id, String url) {}

    private final RestClient restClient = RestClient.create();
    private final LoadBalancerClient loadBalancer;

    public MediaClient(LoadBalancerClient loadBalancer) {
        this.loadBalancer = loadBalancer;
    }

    private String baseUrl() {
        ServiceInstance instance = loadBalancer.choose(MEDIA_SERVICE_ID);
        if (instance == null) {
            throw new MediaServiceException(HttpStatus.SERVICE_UNAVAILABLE, "Media service is unavailable");
        }
        return instance.getUri() + "/media/images";
    }

    public MediaInfo upload(MultipartFile file, String productId, String userId) {
        try {
            String contentType = file.getContentType() != null
                    ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
            HttpHeaders fileHeaders = new HttpHeaders();
            fileHeaders.setContentType(MediaType.parseMediaType(contentType));
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new HttpEntity<>(resource, fileHeaders));
            body.add("productId", productId);
            body.add("userId", userId);

            Map<String, Object> response = restClient.post()
                    .uri(baseUrl() + "/upload")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            return new MediaInfo((String) response.get("id"), (String) response.get("url"));
        } catch (RestClientResponseException e) {
            HttpStatus status = e.getStatusCode().is4xxClientError()
                    ? HttpStatus.valueOf(e.getStatusCode().value()) : HttpStatus.BAD_GATEWAY;
            throw new MediaServiceException(status, e.getResponseBodyAsString());
        } catch (RestClientException e) {
            throw new MediaServiceException(HttpStatus.SERVICE_UNAVAILABLE, "Media service is unavailable");
        } catch (IOException e) {
            throw new MediaServiceException(HttpStatus.BAD_REQUEST, "Image file is not readable");
        }
    }

    public void delete(String mediaId, String userId) {
        try {
            restClient.delete()
                    .uri(baseUrl() + "/{id}?userId={userId}", mediaId, userId)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException e) {
            log.warn("Could not roll back media {}: {}", mediaId, e.getMessage());
        }
    }
}
