package media_service.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import media_service.Exception.MediaNotFoundException;
import media_service.Mapper.MediaMapper;
import media_service.collections.Media;
import media_service.dto.MediaResponseDto;
import media_service.kafka.ImageEventProducer;
import media_service.reposetory.MediaRepository;
import org.apache.tika.Tika;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaRepository mediaRepository;
    private final FileStorageService fileStorageService;
    private final MediaMapper mediaMapper;
    private final ImageEventProducer imageEventProducer;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public MediaResponseDto uploadImage(MultipartFile file, String productId, String userId) {
        validateFile(file);

        String publicId = productId + "_" + userId + "_" + System.currentTimeMillis();
        Map<String, Object> uploadResult = fileStorageService.uploadFile(file, publicId);

        Media media = new Media();
        media.setProductId(productId);
        media.setUserId(userId);
        media.setContentType(file.getContentType());
        media.setSize(file.getSize());
        media.setPublicId((String) uploadResult.get("public_id"));
        media.setUrl((String) uploadResult.get("secure_url"));

        Media saved = mediaRepository.save(media);
        imageEventProducer.publishImageUploaded(productId, saved.getUrl());
        return mediaMapper.toDto(saved);
    }

    public MediaResponseDto get(String id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new MediaNotFoundException("Media not found: " + id));
        return mediaMapper.toDto(media);
    }

    public void delete(String id, String userId) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new MediaNotFoundException("Media not found: " + id));
        if (!Objects.equals(media.getUserId(), userId)) {
            throw new AccessDeniedException("You do not own this media");
        }
        fileStorageService.delete(media.getPublicId());
        mediaRepository.deleteById(id);
    }

    public List<MediaResponseDto> getAll() {
        return mediaRepository.findAll().stream()
                .map(mediaMapper::toDto)
                .toList();
    }

    public MediaResponseDto update(String id, MultipartFile file, String userId) {
        validateFile(file);
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new MediaNotFoundException("Media not found: " + id));
        if (!Objects.equals(media.getUserId(), userId)) {
            throw new AccessDeniedException("You do not own this media");
        }

        String oldPublicId = media.getPublicId();
        Map<String, Object> uploadResult = fileStorageService.uploadFile(file,
                media.getProductId() + "_" + userId + "_" + System.currentTimeMillis());
        media.setContentType(file.getContentType());
        media.setSize(file.getSize());
        media.setPublicId((String) uploadResult.get("public_id"));
        media.setUrl((String) uploadResult.get("secure_url"));
        Media saved = mediaRepository.save(media);
        fileStorageService.delete(oldPublicId);
        imageEventProducer.publishImageUploaded(saved.getProductId(), saved.getUrl());
        return mediaMapper.toDto(saved);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds the limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        try {
            String detected = new Tika().detect(file.getInputStream());
            if (!detected.startsWith("image/")) {
                throw new IllegalArgumentException("File content is not a valid image");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("File is not readable");
        }
    }
}