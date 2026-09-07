package media_service.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import media_service.collections.Media;
import media_service.dto.MediaResponseDto;
import media_service.services.MediaService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/media/images")
public class MediaController {
    private final MediaService mediaService;


    @PostMapping("/upload")
    public ResponseEntity<MediaResponseDto> uploadImage(@RequestParam("file") MultipartFile file,
                             @RequestParam("productId") String productId,
                             @RequestParam("userId") String userId) {
        return ResponseEntity.ok(mediaService.upload(file, productId, userId));
    }


    @GetMapping("/{id}")
    public ResponseEntity<MediaResponseDto> get(@PathVariable String id) {
        return ResponseEntity.ok(mediaService.get(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @RequestParam("userId") String userId) {
        mediaService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

}
