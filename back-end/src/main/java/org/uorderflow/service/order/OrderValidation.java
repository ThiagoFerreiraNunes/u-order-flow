package org.uorderflow.service.order;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.uorderflow.enums.order.OrderAction;
import org.uorderflow.enums.order.OrderStatus;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.Order;
import org.uorderflow.repository.OrderRepository;

@Component
public class OrderValidation {

    @Autowired OrderRepository orderRepository;

    public Order validateOrder(Long id, OrderAction action){
        Order order = orderRepository
                .findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id " + id + "."));

        if(action == null){
            return order;
        }

        switch (action){
            case UPDATE -> {
                if(order.getStatus() != OrderStatus.WAITING){
                    throw new BusinessRuleException("An order can only be edited if its status is WAITING.");
                }
            }
            case PREPARE -> {
                if(order.getStatus() != OrderStatus.WAITING){
                    throw new BusinessRuleException("An order can only be prepared if its status is WAITING.");
                }
            }
            case DELIVER -> {
                if(order.getStatus() != OrderStatus.PREPARING){
                    throw new BusinessRuleException("An order can only be delivered if its status is PREPARING.");
                }
            }
            case CANCEL -> {
                if(order.getStatus() == OrderStatus.CANCELLED){
                    throw new BusinessRuleException("An order cannot be cancelled if its status is already CANCELLED.");
                }
                if(order.getStatus() == OrderStatus.DELIVERED){
                    throw new BusinessRuleException("An order cannot be cancelled if its status is DELIVERED.");
                }
            }
        }
        return order;
    }
}
