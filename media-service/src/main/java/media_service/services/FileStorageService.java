package media_service.services;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class FileStorageService {
    private final Cloudinary cloudinary;

    public Map<String,Object> uploadFile(MultipartFile file , String publicId){
        try {
             Map uploadResult =cloudinary.uploader().upload(file.getBytes(),
              ObjectUtils.asMap(
                "public_id", publicId,
                    "folder", "media-service",
                    "resource_type", "image"
              ));
              return uploadResult;
        } catch (Exception e) {    
                throw new RuntimeException("Failed to upload to Cloudinary", e);
        }
    }

    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy("buy-01/products/" + publicId,
                    ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete from Cloudinary", e);
        }
    }
}