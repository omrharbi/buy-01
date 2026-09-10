package product_service.Mapper;

import org.mapstruct.Mapper;
import product_service.collections.Product;
import product_service.dto.ProductDto;
import product_service.dto.RequestProduct;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductDto toDto(Product product);
    Product toEntity(RequestProduct requestProduct);
}