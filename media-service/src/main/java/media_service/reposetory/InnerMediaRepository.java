package media_service.reposetory;

import javax.print.attribute.standard.Media;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface InnerMediaRepository extends MongoRepository<Media, String> {

}
