package org.uorderflow.service.order;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.uorderflow.dto.order.OrderCreateDTO;
import org.uorderflow.dto.order.OrderDetailsResponseDTO;
import org.uorderflow.dto.order.OrderSummaryResponseDTO;
import org.uorderflow.dto.order.OrderUpdateDTO;
import org.uorderflow.dto.orderProduct.OrderProductCreateDTO;
import org.uorderflow.enums.OrderAction;
import org.uorderflow.model.*;
import org.uorderflow.repository.OrderRepository;
import org.uorderflow.enums.ValidateAction;
import org.uorderflow.service.bill.BillValidation;
import org.uorderflow.service.product.ProductValidation;
import org.uorderflow.service.table.RestaurantTableValidation;

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
        RestaurantTable restaurantTable = restaurantTableValidation.validateRestaurantTable(data.restaurantTableId(), ValidateAction.ACTIVE_CHECK);
        Order order = new Order(data, restaurantTable);

        for (OrderProductCreateDTO item : data.items()){
            Product product = productValidation.validateProduct(item.productId(), ValidateAction.ACTIVE_CHECK);
            OrderProduct orderProduct = new OrderProduct(item, product);
            order.addItem(orderProduct);
        }

        bill.addOrder(order);
        orderRepository.save(order);
        return new OrderDetailsResponseDTO(order);
    }


    public Page<OrderSummaryResponseDTO> findAll(Pageable pageable){
        return orderRepository.findAllPaged(pageable).map(OrderSummaryResponseDTO::new);
    }

    public OrderDetailsResponseDTO findById(Long id){
        Order order = orderValidation.validateOrder(id, null);
        return new OrderDetailsResponseDTO(order);
    }

    @Transactional
    public OrderDetailsResponseDTO update(Long id, OrderUpdateDTO data){
        Order order = orderValidation.validateOrder(id, OrderAction.UPDATE);
        RestaurantTable restaurantTable = null;

        if (data.restaurantTableId() != null){
            restaurantTable = restaurantTableValidation.validateRestaurantTable(data.restaurantTableId(), ValidateAction.ACTIVE_CHECK);
        }

        order.update(data, restaurantTable);

        if (data.items() != null){
            order.getItems().clear();

            for (OrderProductCreateDTO item : data.items()) {
                Product product = productValidation.validateProduct(item.productId(), ValidateAction.ACTIVE_CHECK);
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
