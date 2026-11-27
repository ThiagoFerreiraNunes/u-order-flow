package org.uorderflow.service.product;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.enums.order.OrderStatus;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.Product;
import org.uorderflow.repository.OrderProductRepository;
import org.uorderflow.repository.ProductRepository;

import java.util.List;

@Component
public class ProductValidation {

    private final ProductRepository productRepository;
    private final OrderProductRepository orderProductRepository;

    public ProductValidation(ProductRepository productRepository,
                             OrderProductRepository orderProductRepository) {
        this.productRepository = productRepository;
        this.orderProductRepository = orderProductRepository;
    }

    public Product validateProduct(Long id){
        Product product = productRepository
                .findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id " + id + "."));

        return product;
    }

    public void validateProductDeletion(Long productId) {
        List<OrderStatus> activeStatuses = List.of(OrderStatus.WAITING, OrderStatus.PREPARING);

        if (orderProductRepository.existsByProductIdAndOrderStatusIn(productId, activeStatuses)) {
            throw new BusinessRuleException("Cannot delete a product while there are active orders (Waiting or Preparing) containing it.");
        }
    }
}
