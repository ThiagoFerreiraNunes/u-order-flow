package org.uorderflow.service.product;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.product.ProductDetailsResponseDTO;
import org.uorderflow.dto.product.ProductUpdateDTO;
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

    public List<ProductDetailsResponseDTO> findAll(){
        return productRepository.findAllByAvailableAndSortByName().stream().map(ProductDetailsResponseDTO::new).toList();
    }

    public ProductDetailsResponseDTO findById(Long id){
        Product product = productValidation.validateProduct(id, ValidateAction.ACTIVE_CHECK);
        return new ProductDetailsResponseDTO(product);
    }

    @Transactional
    public ProductDetailsResponseDTO update(Long id, ProductUpdateDTO data){
        ProductCategory productCategory = null;
        if(data.productCategoryId() != null){
            productCategory = productCategoryValidation.validateProductCategory(data.productCategoryId(), ValidateAction.ACTIVE_CHECK);
        }
        Product product = productValidation.validateProduct(id, ValidateAction.ACTIVE_CHECK);
        product.update(data, productCategory);
        return new ProductDetailsResponseDTO(product);
    }

    @Transactional
    public void delete(Long id){
        Product product = productValidation.validateProduct(id, ValidateAction.DELETE);
        product.delete();
    }

    @Transactional
    public ProductDetailsResponseDTO reactivate(Long id){
        Product product = productValidation.validateProduct(id, ValidateAction.REACTIVATE);
        product.reactivate();
        return new ProductDetailsResponseDTO(product);
    }
}
