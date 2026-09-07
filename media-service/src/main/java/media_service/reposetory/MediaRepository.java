package media_service.reposetory;

import org.springframework.data.mongodb.repository.MongoRepository;

import media_service.collections.Media;

public interface MediaRepository extends MongoRepository<Media, String> {

}
