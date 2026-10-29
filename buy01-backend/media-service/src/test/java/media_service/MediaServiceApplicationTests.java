package media_service;

import com.fasterxml.jackson.databind.ObjectMapper;
import media_service.dto.MediaResponseDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
		"cloudinary.cloud-name=test-cloud",
		"cloudinary.api-key=test-api-key",
		"cloudinary.api-secret=test-api-secret"
})
class MediaServiceApplicationTests {

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void contextLoads() {
	}

	@Test
	void mediaResponseDoesNotExposeOwnerOrProviderIdentifiers() throws Exception {
		String response = objectMapper.writeValueAsString(new MediaResponseDto());

		assertThat(response).doesNotContain("ownerId", "publicId");
	}

}
