package org.uorderflow.service.product;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.enums.product.ProductAction;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.Product;
import org.uorderflow.repository.ProductRepository;

@Component
public class ProductValidation {

    private final ProductRepository productRepository;

    public ProductValidation(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product validateProduct(Long id, ProductAction action){
        Product product = productRepository
                .findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id " + id + "."));

        switch (action){
            case ACTIVE_CHECK -> {
                if(Boolean.TRUE.equals(product.getIsDeleted())){
                    throw new BusinessRuleException("Product is deleted with id " + id + ".");
                }
            }
            case CREATE_ORDER_PRODUCT -> {
                if(Boolean.FALSE.equals(product.getIsAvailable())){
                    throw new BusinessRuleException("Product is not available with id " + id + ".");
                }
            }
        }
        return product;
    }

    public void validateUniqueFields(String name){
        if(productRepository.existsByName(name)){
            throw new BusinessRuleException("A Product with the name '" + name + "' already exists");
        }
    }
}
