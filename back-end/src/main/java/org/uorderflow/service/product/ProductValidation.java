package org.uorderflow.service.product;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.model.Product;
import org.uorderflow.repository.ProductRepository;

@Component
public class ProductValidation {

    private final ProductRepository productRepository;

    public ProductValidation(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product validateProduct(Long id){
        Product product = productRepository
                .findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id " + id + "."));

        return product;
    }
}
