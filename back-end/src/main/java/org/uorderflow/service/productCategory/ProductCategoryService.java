package org.uorderflow.service.productCategory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.productCategory.ProductCategoryCreateDTO;
import org.uorderflow.dto.productCategory.ProductCategoryResponseDTO;
import org.uorderflow.dto.productCategory.ProductCategoryUpdateDTO;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductCategoryRepository;

import java.util.List;

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
        if(productCategoryRepository.existsByName(data.name())){
            throw new BusinessRuleException("A ProductCategory with the name '" + data.name() + "' already exists");
        }

        ProductCategory productCategory = new ProductCategory(data);
        productCategoryRepository.save(productCategory);
        return new ProductCategoryResponseDTO(productCategory);
    }

    @Transactional(readOnly = true)
    public List<ProductCategoryResponseDTO> findAll(){
        return productCategoryRepository.findAllSorted().stream()
                .map(ProductCategoryResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductCategoryResponseDTO findById(Long id){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(id);
        return new ProductCategoryResponseDTO(productCategory);
    }

    @Transactional
    public ProductCategoryResponseDTO update(Long id, ProductCategoryUpdateDTO data){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(id);

        if(data.name() != null && !data.name().equals(productCategory.getName())){
            boolean nameExists = productCategoryRepository.existsByNameAndIdNot(data.name(), id);
            if (nameExists) {
                throw new BusinessRuleException("A ProductCategory with the name '" + data.name() + "' already exists");
            }
        }

        productCategory.update(data);
        return new ProductCategoryResponseDTO(productCategory);
    }

    @Transactional
    public void delete(Long id){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(id);
        productCategory.delete();
    }
}
