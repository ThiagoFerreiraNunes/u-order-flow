package org.uorderflow.service.productCategory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.productCategory.ProductCategoryCreateDTO;
import org.uorderflow.dto.productCategory.ProductCategoryResponseDTO;
import org.uorderflow.dto.productCategory.ProductCategoryUpdateDTO;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductCategoryRepository;
import org.uorderflow.enums.ValidateAction;

import java.util.List;

@Service
public class ProductCategoryService {

    @Autowired
    ProductCategoryRepository productCategoryRepository;
    @Autowired
    ProductCategoryValidation productCategoryValidation;

    @Transactional
    public ProductCategoryResponseDTO create(ProductCategoryCreateDTO data){
        ProductCategory productCategory = new ProductCategory(data);
        productCategoryRepository.save(productCategory);
        return new ProductCategoryResponseDTO(productCategory);
    }

    @Transactional(readOnly = true)
    public List<ProductCategoryResponseDTO> findAll(){
        return productCategoryRepository.findAllByNotDeletedAndSortByName().stream().map(ProductCategoryResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public ProductCategoryResponseDTO findById(Long id){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(id, ValidateAction.ACTIVE_CHECK);
        return new ProductCategoryResponseDTO(productCategory);
    }

    @Transactional
    public ProductCategoryResponseDTO update(Long id, ProductCategoryUpdateDTO data){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(id, ValidateAction.ACTIVE_CHECK);
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
