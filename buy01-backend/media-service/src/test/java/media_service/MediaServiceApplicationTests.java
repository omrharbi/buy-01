package media_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"cloudinary.cloud-name=test-cloud",
		"cloudinary.api-key=test-api-key",
		"cloudinary.api-secret=test-api-secret"
})
class MediaServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
