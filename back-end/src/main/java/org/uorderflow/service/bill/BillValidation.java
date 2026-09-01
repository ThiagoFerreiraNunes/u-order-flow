package org.uorderflow.service.bill;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.uorderflow.enums.bill.BillAction;
import org.uorderflow.enums.bill.BillStatus;
import org.uorderflow.exception.BusinessRuleException;
import org.uorderflow.model.Bill;
import org.uorderflow.repository.BillRepository;

@Component
public class BillValidation {

    @Autowired BillRepository billRepository;

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
                if(bill.getStatus() == BillStatus.CANCELLED){
                    throw new BusinessRuleException("A bill cannot be cancelled if its status is already CANCELLED.");
                }
                if(bill.getStatus() == BillStatus.PAID){
                    throw new BusinessRuleException("A bill cannot be cancelled if its status is PAID.");
                }
            }
            case CLOSE -> {
                if(bill.getStatus() == BillStatus.CLOSED){
                    throw new BusinessRuleException("A bill cannot be closed if its status is already CLOSED.");
                }
                if(bill.getStatus() == BillStatus.CANCELLED){
                    throw new BusinessRuleException("A bill cannot be closed if its status is CANCELLED.");
                }
            }
            case PAY -> {
                if(bill.getStatus() == BillStatus.PAID){
                    throw new BusinessRuleException("A bill cannot be paid if its status is already PAID.");
                }
                if(bill.getStatus() == BillStatus.CANCELLED){
                    throw new BusinessRuleException("A bill cannot be paid if its status is CANCELLED.");
                }
            }
        }

        return bill;
    }
}
