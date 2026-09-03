package org.uorderflow.service.order;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.order.OrderCreateDTO;
import org.uorderflow.dto.order.OrderDetailsResponseDTO;
import org.uorderflow.dto.order.OrderSummaryResponseDTO;
import org.uorderflow.dto.order.OrderUpdateDTO;
import org.uorderflow.dto.orderProduct.OrderProductCreateDTO;
import org.uorderflow.enums.order.OrderAction;
import org.uorderflow.enums.product.ProductAction;
import org.uorderflow.model.*;
import org.uorderflow.repository.OrderRepository;
import org.uorderflow.enums.generic.ValidateAction;
import org.uorderflow.service.bill.BillValidation;
import org.uorderflow.service.product.ProductValidation;
import org.uorderflow.service.restaurantTable.RestaurantTableValidation;

@Service
public class OrderService {

    @Autowired OrderRepository orderRepository;
    @Autowired OrderValidation orderValidation;
    @Autowired BillValidation billValidation;
    @Autowired RestaurantTableValidation restaurantTableValidation;
    @Autowired ProductValidation productValidation;

    @Transactional
    public OrderDetailsResponseDTO createOrder(Long billId, OrderCreateDTO data){
        Bill bill = billValidation.validateBill(billId, null);
        Order order = new Order(data);

        for (OrderProductCreateDTO item : data.items()){
            Product product = productValidation.validateProduct(item.productId(), ProductAction.CREATE_ORDER_PRODUCT);
            OrderProduct orderProduct = new OrderProduct(item, product);
            order.addItem(orderProduct);
        }

        bill.addOrder(order);
        orderRepository.save(order);
        return new OrderDetailsResponseDTO(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderSummaryResponseDTO> findAll(Pageable pageable){
        return orderRepository.findAllPaged(pageable).map(OrderSummaryResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public OrderDetailsResponseDTO findById(Long id){
        Order order = orderValidation.validateOrder(id, null);
        return new OrderDetailsResponseDTO(order);
    }

    @Transactional
    public OrderDetailsResponseDTO update(Long id, OrderUpdateDTO data){
        Order order = orderValidation.validateOrder(id, OrderAction.UPDATE);
        order.update(data);

        if (data.items() != null){
            order.getItems().clear();

            for (OrderProductCreateDTO item : data.items()) {
                Product product = productValidation.validateProduct(item.productId(), ProductAction.CREATE_ORDER_PRODUCT);
                OrderProduct orderProduct = new OrderProduct(item, product);
                order.addItem(orderProduct);
            }
        }

        return new OrderDetailsResponseDTO(order);
    }

    @Transactional
    public OrderDetailsResponseDTO prepareOrder(Long id){
        Order order = orderValidation.validateOrder(id, OrderAction.PREPARE);
        order.prepareOrder();
        return new OrderDetailsResponseDTO(order);
    }

    @Transactional
    public OrderDetailsResponseDTO deliverOrder(Long id){
        Order order = orderValidation.validateOrder(id, OrderAction.DELIVER);
        order.deliverOrder();
        return new OrderDetailsResponseDTO(order);
    }

    @Transactional
    public OrderDetailsResponseDTO cancelOrder(Long id){
        Order order = orderValidation.validateOrder(id, OrderAction.CANCEL);
        order.cancelOrder();
        return new OrderDetailsResponseDTO(order);
    }
}
