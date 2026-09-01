package org.uorderflow.service.product;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.product.ProductDetailsResponseDTO;
import org.uorderflow.dto.product.ProductUpdateDTO;
import org.uorderflow.enums.ProductAction;
import org.uorderflow.model.Product;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductRepository;
import org.uorderflow.enums.ValidateAction;
import org.uorderflow.service.productCategory.ProductCategoryValidation;

import java.util.List;

@Service
public class ProductService {

    @Autowired ProductRepository productRepository;
    @Autowired ProductValidation productValidation;
    @Autowired ProductCategoryValidation productCategoryValidation;

    @Transactional
    public ProductDetailsResponseDTO create(ProductCreateDTO data){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(data.productCategoryId(), ValidateAction.ACTIVE_CHECK);
        Product product = new Product(data, productCategory);
        productRepository.save(product);
        return new ProductDetailsResponseDTO(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDetailsResponseDTO> findAll(){
        return productRepository.findAllByNotDeletedAndSortByName().stream().map(ProductDetailsResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public ProductDetailsResponseDTO findById(Long id){
        Product product = productValidation.validateProduct(id, ProductAction.ACTIVE_CHECK);
        return new ProductDetailsResponseDTO(product);
    }

    @Transactional
    public ProductDetailsResponseDTO update(Long id, ProductUpdateDTO data){
        ProductCategory productCategory = null;
        if(data.productCategoryId() != null){
            productCategory = productCategoryValidation.validateProductCategory(data.productCategoryId(), ValidateAction.ACTIVE_CHECK);
        }
        Product product = productValidation.validateProduct(id, ProductAction.ACTIVE_CHECK);
        product.update(data, productCategory);
        return new ProductDetailsResponseDTO(product);
    }

    @Transactional
    public void delete(Long id){
        Product product = productValidation.validateProduct(id, ProductAction.DELETE);
        product.delete();
    }

    @Transactional
    public ProductDetailsResponseDTO reactivate(Long id){
        Product product = productValidation.validateProduct(id, ProductAction.REACTIVATE);
        product.reactivate();
        return new ProductDetailsResponseDTO(product);
    }
}
