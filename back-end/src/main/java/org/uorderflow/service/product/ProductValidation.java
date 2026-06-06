package org.uorderflow.service.product;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.uorderflow.exception.BusinessRuleException;
import org.uorderflow.model.Product;
import org.uorderflow.repository.ProductRepository;
import org.uorderflow.enums.ValidateAction;

@Component
public class ProductValidation {

    @Autowired ProductRepository productRepository;

    public Product validateProduct(Long id, ValidateAction action){
        Product product = productRepository
                .findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id " + id + "."));

        switch (action){
            case ACTIVE_CHECK -> {
                if(Boolean.FALSE.equals(product.getIsAvailable())){
                    throw new BusinessRuleException("Product not available with id " + id + ".");
                }
            }
            case DELETE -> {
                if(Boolean.FALSE.equals(product.getIsAvailable())){
                    throw new BusinessRuleException("Product is already not available with id " + id + ".");
                }
            }
            case REACTIVATE -> {
                if(Boolean.TRUE.equals(product.getIsAvailable())){
                    throw new BusinessRuleException("Product is already available with id " + id + ".");
                }
            }
        }
        return product;
    }
}
