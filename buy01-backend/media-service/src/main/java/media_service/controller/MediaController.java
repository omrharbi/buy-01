package media_service.controller;

import lombok.RequiredArgsConstructor;
import media_service.dto.MediaResponseDto;
import media_service.security.JwtPrincipal;
import media_service.services.MediaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
            @RequestParam(value = "productId", required = false) String productId,
            @AuthenticationPrincipal JwtPrincipal principal) {
        MediaResponseDto dto = mediaService.uploadImage(file, productId, principal.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/me")
    public ResponseEntity<List<MediaResponseDto>> getMine(@AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(mediaService.getMine(principal.id()));
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
            @AuthenticationPrincipal JwtPrincipal principal) {
        return ResponseEntity.ok(mediaService.update(id, file, principal.id()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @AuthenticationPrincipal JwtPrincipal principal) {
        mediaService.delete(id, principal.id());
        return ResponseEntity.noContent().build();
    }
}
