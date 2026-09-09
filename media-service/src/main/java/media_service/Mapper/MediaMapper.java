package media_service.Mapper;

import org.mapstruct.Mapper;

import media_service.collections.Media;
import media_service.dto.MediaResponseDto;

@Mapper(componentModel = "spring")
public interface MediaMapper {
    MediaResponseDto toDto(Media media);
}