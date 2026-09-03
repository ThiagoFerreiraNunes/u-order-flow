package org.uorderflow.service.productCategory;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductCategoryRepository;
import org.uorderflow.enums.generic.ValidateAction;

@Component
public class ProductCategoryValidation {

    private final ProductCategoryRepository productCategoryRepository;

    public ProductCategoryValidation(ProductCategoryRepository productCategoryRepository) {
        this.productCategoryRepository = productCategoryRepository;
    }

    public ProductCategory validateProductCategory(Long id, ValidateAction action){
        ProductCategory productCategory = productCategoryRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ProductCategory not found with id " + id + "."));

        switch (action){
            case ACTIVE_CHECK -> {
                if(Boolean.TRUE.equals(productCategory.getIsDeleted())){
                    throw new BusinessRuleException("ProductCategory is deleted with id " + id + ".");
                }
            }
            case DELETE -> {
                if(Boolean.TRUE.equals(productCategory.getIsDeleted())){
                    throw new BusinessRuleException("ProductCategory is already deleted with id " + id + ".");
                }
            }
            case REACTIVATE -> {
                if(Boolean.FALSE.equals(productCategory.getIsDeleted())){
                    throw new BusinessRuleException("ProductCategory is already activated with id " + id + ".");
                }
            }
        }
        return productCategory;
    }

    public void validateUniqueFields(String name){
        if(productCategoryRepository.existsByName(name)){
            throw new BusinessRuleException("A ProductCategory with the name '" + name + "' already exists");
        }
    }
}
