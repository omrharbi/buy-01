package media_service.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileStorageService {

    private final Cloudinary cloudinary;

    public Map<String, Object> uploadFile(MultipartFile file, String publicId) {
        try {
            return cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "folder", "media-service",
                            "resource_type", "image"
                    ));
        } catch (Exception e) {
            log.error("Cloudinary upload failed for {}: {}", publicId, e.getMessage(), e);
            throw new RuntimeException("Failed to upload to Cloudinary", e);
        }
    }

    public void delete(String publicId) {
        try {
            String cloudinaryPublicId = publicId.startsWith("media-service/")
                    ? publicId
                    : "media-service/" + publicId;
            cloudinary.uploader().destroy(cloudinaryPublicId,
                    ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete from Cloudinary", e);
        }
    }
}