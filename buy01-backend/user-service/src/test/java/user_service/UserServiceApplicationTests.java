package user_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "JWT_SECRET=test-only-jwt-secret-with-at-least-32-characters")
class UserServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
