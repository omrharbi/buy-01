package media_service.services;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import media_service.Mapper.MediaMapper;
import media_service.kafka.ImageEventProducer;
import media_service.reposetory.MediaRepository;

class MediaServiceValidationTest {

    @Test
    void uploadImageRejectsNonImageContentType() {
        MediaRepository mediaRepository = mock(MediaRepository.class);
        FileStorageService fileStorageService = mock(FileStorageService.class);
        MediaMapper mediaMapper = mock(MediaMapper.class);
        ImageEventProducer imageEventProducer = mock(ImageEventProducer.class);
        MediaService mediaService = new MediaService(mediaRepository, fileStorageService, mediaMapper, imageEventProducer);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "notes.txt",
                "text/plain",
                "hello world".getBytes(StandardCharsets.UTF_8)
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> mediaService.uploadImage(file, "product-1", "seller-1"));

        assertTrue(ex.getMessage().contains("Only image files are allowed"));
    }

    @Test
    void uploadImageRejectsOversizeFile() {
        MediaRepository mediaRepository = mock(MediaRepository.class);
        FileStorageService fileStorageService = mock(FileStorageService.class);
        MediaMapper mediaMapper = mock(MediaMapper.class);
        ImageEventProducer imageEventProducer = mock(ImageEventProducer.class);
        MediaService mediaService = new MediaService(mediaRepository, fileStorageService, mediaMapper, imageEventProducer);

        byte[] payload = new byte[6 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                payload
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> mediaService.uploadImage(file, "product-1", "seller-1"));

        assertTrue(ex.getMessage().contains("File size exceeds the limit"));
    }
}
