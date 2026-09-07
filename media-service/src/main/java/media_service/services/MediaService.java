package media_service.services;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.NoSuchElementException;

import org.apache.tika.Tika;
import lombok.RequiredArgsConstructor;
import media_service.Mapper.MediaMapper;
import media_service.collections.Media;
import media_service.dto.MediaResponseDto;
import media_service.reposetory.MediaRepository;
@Service
@RequiredArgsConstructor
public class MediaService {
    private final MediaRepository mediaRepository;
    private final FileStorageService fileStorageService;
    private final MediaMapper mediaMapper;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    public MediaResponseDto upload(MultipartFile file, String productId, String userId){
        
        validateFile(file);
        String publicId = productId + "_" + userId + "_" + System.currentTimeMillis();
        Map<String, Object> uploadResult = fileStorageService.uploadFile(file, publicId);

        Media media = new Media();
        media.setProductId(productId);
        media.setUserId(userId);
        media.setContentType(file.getContentType());
        media.setSize(file.getSize());
        media.setPublicId((String) uploadResult.get("public_id"));
        media.setUrl((String) uploadResult.get("fileUrl"));
        mediaRepository.save(media);
        return mediaMapper.toDto(media);
    }

    public MediaResponseDto get(String id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new 
                NoSuchElementException("Media not found"));
        return mediaMapper.toDto(media);
    }

    public void delete(String id, String userId) {
        MediaResponseDto media = get(id);
        if (!media.getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not own this media");
        }
        fileStorageService.delete(media.getPublicId());
        mediaRepository.deleteById(id);
    }
    
    private void validateFile (MultipartFile file){
        if (file==null || file.isEmpty()){
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE){
            throw new IllegalArgumentException("File size exceeds the limit");
        }
        final String contentType = file.getContentType();
        if (!contentType.startsWith("image/")){
            throw new IllegalArgumentException("Only image files are allowed");
        }
        try{
             String detected = new Tika().detect(file.getInputStream()).toString();
             if (!detected.startsWith("image/")) {
                throw new IllegalArgumentException("File content is not a valid image");
            }
        } catch (Exception e){
            throw new IllegalArgumentException("File is not readable");
        }
    }
}
