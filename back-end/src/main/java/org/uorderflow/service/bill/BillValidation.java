package org.uorderflow.service.bill;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.enums.bill.BillAction;
import org.uorderflow.enums.bill.BillStatus;
import org.uorderflow.enums.order.OrderStatus;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.Bill;
import org.uorderflow.model.Order;
import org.uorderflow.repository.BillRepository;

@Component
public class BillValidation {

    private final BillRepository billRepository;

    public BillValidation(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    public Bill validateBill(Long id, BillAction action){
        Bill bill = billRepository
                .findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Bill not found with id " + id + "."));

        if(action == null){
            return bill;
        }

        switch (action){
            case UPDATE -> {
                if(bill.getStatus() != BillStatus.OPEN){
                    throw new BusinessRuleException("A bill can only be updated if its status is OPEN.");
                }
            }
            case CANCEL -> {
                if(bill.getStatus() == BillStatus.PAID){
                    throw new BusinessRuleException("A bill cannot be cancelled if its status is PAID.");
                }

                boolean hasNonDeliveredOrders = bill.getOrders().stream()
                        .anyMatch(order -> order.getStatus() != OrderStatus.DELIVERED);

                if (!hasNonDeliveredOrders && !bill.getOrders().isEmpty()) {
                    throw new BusinessRuleException("Cannot cancel a bill with delivered orders. Please close and pay the bill instead.");
                }

                for (Order order : bill.getOrders()) {
                    if (order.getStatus() == OrderStatus.WAITING || order.getStatus() == OrderStatus.PREPARING) {
                        order.cancelOrder();
                    }
                }
            }
            case CLOSE -> {
                if(bill.getStatus() == BillStatus.CANCELLED){
                    throw new BusinessRuleException("A bill cannot be closed if its status is CANCELLED.");
                }
            }
            case PAY -> {
                if(bill.getStatus() == BillStatus.CANCELLED){
                    throw new BusinessRuleException("A bill cannot be paid if its status is CANCELLED.");
                }
            }
            case ADD_ORDER -> {
                if(bill.getStatus() != BillStatus.OPEN){
                    throw new BusinessRuleException("New orders can only be added to a bill if its status is OPEN.");
                }
            }
        }

        return bill;
    }
}
