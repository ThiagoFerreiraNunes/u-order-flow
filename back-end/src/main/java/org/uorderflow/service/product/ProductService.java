package org.uorderflow.service.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.product.ProductDetailsResponseDTO;
import org.uorderflow.dto.product.ProductSummaryResponseDTO;
import org.uorderflow.dto.product.ProductUpdateDTO;
import org.uorderflow.enums.product.ProductAction;
import org.uorderflow.model.Product;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductRepository;
import org.uorderflow.service.productCategory.ProductCategoryValidation;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductValidation productValidation;
    private final ProductCategoryValidation productCategoryValidation;

    public ProductService(ProductRepository productRepository,
                          ProductValidation productValidation,
                          ProductCategoryValidation productCategoryValidation) {
        this.productRepository = productRepository;
        this.productValidation = productValidation;
        this.productCategoryValidation = productCategoryValidation;
    }

    @Transactional
    public ProductDetailsResponseDTO create(ProductCreateDTO data){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(data.productCategoryId());
        productValidation.validateUniqueFields(data.name());
        Product product = new Product(data, productCategory);
        productRepository.save(product);
        return new ProductDetailsResponseDTO(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductDetailsResponseDTO> findAll(Pageable pageable){
        return productRepository.findAllPagedByIsDeletedFalse(pageable).map(ProductDetailsResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponseDTO> searchAllByName(String name, Pageable pageable){
        return productRepository.searchAllPagedByName(name, pageable).map(ProductSummaryResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public ProductDetailsResponseDTO findById(Long id){
        Product product = productValidation.validateProduct(id, ProductAction.ACTIVE_CHECK);
        return new ProductDetailsResponseDTO(product);
    }

    @Transactional
    public ProductDetailsResponseDTO update(Long id, ProductUpdateDTO data){
        Product product = productValidation.validateProduct(id, ProductAction.ACTIVE_CHECK);

        if(data.name() != null && !data.name().equals(product.getName())){
            productValidation.validateUniqueFields(data.name());
        }

        ProductCategory productCategory = null;

        if(data.productCategoryId() != null){
            productCategory = productCategoryValidation.validateProductCategory(data.productCategoryId());
        }

        product.update(data, productCategory);
        return new ProductDetailsResponseDTO(product);
    }

    @Transactional
    public void delete(Long id){
        Product product = productValidation.validateProduct(id, ProductAction.ACTIVE_CHECK);
        product.delete();
    }

    @Transactional
    public ProductDetailsResponseDTO reactivate(Long id){
        Product product = productValidation.validateProduct(id, ProductAction.ACTIVE_CHECK);
        product.reactivate();
        return new ProductDetailsResponseDTO(product);
    }
}
