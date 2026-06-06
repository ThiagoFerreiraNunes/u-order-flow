package org.uorderflow.service.productCategory;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.uorderflow.exception.BusinessRuleException;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductCategoryRepository;
import org.uorderflow.service.Action;

@Component
public class ProductCategoryValidation {
    @Autowired
    ProductCategoryRepository productCategoryRepository;

    public ProductCategory validateProductCategory(Long id, Action action){
        ProductCategory productCategory = productCategoryRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ProductCategory not found with id " + id + "."));

        switch (action){
            case ACTIVE_CHECK -> {
                if(Boolean.FALSE.equals(productCategory.getIsAvailable())){
                    throw new BusinessRuleException("ProductCategory not available with id " + id + ".");
                }
            }
            case DELETE -> {
                if(Boolean.FALSE.equals(productCategory.getIsAvailable())){
                    throw new BusinessRuleException("ProductCategory is already not available with id " + id + ".");
                }
            }
            case REACTIVATE -> {
                if(Boolean.TRUE.equals(productCategory.getIsAvailable())){
                    throw new BusinessRuleException("ProductCategory is already available with id " + id + ".");
                }
            }
        }
        return productCategory;
    }
}
