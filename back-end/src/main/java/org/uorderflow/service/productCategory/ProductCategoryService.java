package org.uorderflow.service.productCategory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.productCategory.ProductCategoryCreateDTO;
import org.uorderflow.dto.productCategory.ProductCategoryResponseDTO;
import org.uorderflow.dto.productCategory.ProductCategoryUpdateDTO;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductCategoryRepository;
import org.uorderflow.enums.generic.ValidateAction;

@Service
public class ProductCategoryService {

    private final ProductCategoryRepository productCategoryRepository;
    private final ProductCategoryValidation productCategoryValidation;

    public ProductCategoryService(ProductCategoryRepository productCategoryRepository,
                                  ProductCategoryValidation productCategoryValidation) {
        this.productCategoryRepository = productCategoryRepository;
        this.productCategoryValidation = productCategoryValidation;
    }

    @Transactional
    public ProductCategoryResponseDTO create(ProductCategoryCreateDTO data){
        productCategoryValidation.validateUniqueFields(data.name());
        ProductCategory productCategory = new ProductCategory(data);
        productCategoryRepository.save(productCategory);
        return new ProductCategoryResponseDTO(productCategory);
    }

    @Transactional(readOnly = true)
    public Page<ProductCategoryResponseDTO> findAll(Pageable pageable){
        return productCategoryRepository.findAllPagedByIsDeletedFalse(pageable).map(ProductCategoryResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public ProductCategoryResponseDTO findById(Long id){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(id, ValidateAction.ACTIVE_CHECK);
        return new ProductCategoryResponseDTO(productCategory);
    }

    @Transactional
    public ProductCategoryResponseDTO update(Long id, ProductCategoryUpdateDTO data){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(id, ValidateAction.ACTIVE_CHECK);

        if(data.name() != null && !data.name().equals(productCategory.getName())){
            productCategoryValidation.validateUniqueFields(data.name());
        }

        productCategory.update(data);
        return new ProductCategoryResponseDTO(productCategory);
    }

    @Transactional
    public void delete(Long id){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(id, ValidateAction.DELETE);
        productCategory.delete();
    }

    @Transactional
    public ProductCategoryResponseDTO reactivate(Long id){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(id, ValidateAction.REACTIVATE);
        productCategory.reactivate();
        return new ProductCategoryResponseDTO(productCategory);
    }
}
