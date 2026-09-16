package media_service.controller;

import lombok.RequiredArgsConstructor;
import media_service.dto.MediaResponseDto;
import media_service.services.MediaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/media/images")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/upload")
    public ResponseEntity<MediaResponseDto> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("productId") String productId,
            @RequestParam("userId") String userId) {
        MediaResponseDto dto = mediaService.uploadImage(file, productId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MediaResponseDto> get(@PathVariable String id) {
        return ResponseEntity.ok(mediaService.get(id));
    }

    @GetMapping
    public ResponseEntity<List<MediaResponseDto>> getAll() {
        return ResponseEntity.ok(mediaService.getAll());
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<MediaResponseDto> update(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId) {
        return ResponseEntity.ok(mediaService.update(id, file, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @RequestParam("userId") String userId) {
        mediaService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}