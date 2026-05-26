package org.uorderflow.service.product;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.product.ProductResponseDTO;
import org.uorderflow.dto.product.ProductUpdateDTO;
import org.uorderflow.model.Product;
import org.uorderflow.model.ProductCategory;
import org.uorderflow.repository.ProductRepository;
import org.uorderflow.service.Action;
import org.uorderflow.service.productCategory.ProductCategoryValidation;

import java.util.List;

@Service
public class ProductService {

    @Autowired ProductRepository productRepository;
    @Autowired ProductValidation productValidation;
    @Autowired ProductCategoryValidation productCategoryValidation;

    @Transactional
    public ProductResponseDTO create(ProductCreateDTO data){
        ProductCategory productCategory = productCategoryValidation.validateProductCategory(data.productCategoryId(), Action.ACTIVE_CHECK);
        Product product = new Product(data, productCategory);
        productRepository.save(product);
        return new ProductResponseDTO(product);
    }

    public List<ProductResponseDTO> findAll(){
        return productRepository.findAllByAvailableAndSortByName().stream().map(ProductResponseDTO::new).toList();
    }

    public ProductResponseDTO findById(Long id){
        Product product = productValidation.validateProduct(id, Action.ACTIVE_CHECK);
        return new ProductResponseDTO(product);
    }

    @Transactional
    public ProductResponseDTO update(Long id, ProductUpdateDTO data){
        ProductCategory productCategory = null;
        if(data.productCategoryId() != null){
            productCategory = productCategoryValidation.validateProductCategory(id, Action.ACTIVE_CHECK);
        }
        Product product = productValidation.validateProduct(id, Action.ACTIVE_CHECK);
        product.update(data, productCategory);
        return new ProductResponseDTO(product);
    }

    @Transactional
    public void delete(Long id){
        Product product = productValidation.validateProduct(id, Action.DELETE);
        product.delete();
    }

    @Transactional
    public ProductResponseDTO reactivate(Long id){
        Product product = productValidation.validateProduct(id, Action.REACTIVATE);
        product.reactivate();
        return new ProductResponseDTO(product);
    }
}
