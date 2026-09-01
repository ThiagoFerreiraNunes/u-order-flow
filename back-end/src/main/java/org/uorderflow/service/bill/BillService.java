package org.uorderflow.service.bill;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.bill.BillCreateDTO;
import org.uorderflow.dto.bill.BillResponseDTO;
import org.uorderflow.dto.bill.BillUpdateDTO;
import org.uorderflow.enums.bill.BillAction;
import org.uorderflow.enums.generic.ValidateAction;
import org.uorderflow.model.Bill;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.BillRepository;
import org.uorderflow.service.restaurantTable.RestaurantTableValidation;

@Service
public class BillService {

    @Autowired BillRepository billRepository;
    @Autowired BillValidation billValidation;
    @Autowired RestaurantTableValidation restaurantTableValidation;

    @Transactional
    public BillResponseDTO createBill(BillCreateDTO data){
        RestaurantTable restaurantTable = restaurantTableValidation.validateRestaurantTable(data.restaurantTableId(), ValidateAction.ACTIVE_CHECK);
        Bill bill = new Bill(data, restaurantTable);
        billRepository.save(bill);
        return new BillResponseDTO(bill);
    }

    @Transactional(readOnly = true)
    public Page<BillResponseDTO> findAll(Pageable pageable){
        return billRepository.findAllPaged(pageable).map(BillResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public BillResponseDTO findById(Long id){
        Bill bill = billValidation.validateBill(id, null);
        return new BillResponseDTO(bill);
    }

    @Transactional
    public BillResponseDTO update(Long id, BillUpdateDTO data){
        Bill bill = billValidation.validateBill(id, BillAction.UPDATE);
        RestaurantTable restaurantTable = null;

        if(data.restaurantTableId() != null){
            restaurantTable = restaurantTableValidation.validateRestaurantTable(data.restaurantTableId(), ValidateAction.ACTIVE_CHECK);
        }

        bill.update(data, restaurantTable);
        return new BillResponseDTO(bill);
    }

    @Transactional
    public BillResponseDTO closeBill(Long id){
        Bill bill = billValidation.validateBill(id, BillAction.CLOSE);
        bill.closeBill();
        return new BillResponseDTO(bill);
    }

    @Transactional
    public BillResponseDTO payBill(Long id){
        Bill bill = billValidation.validateBill(id, BillAction.PAY);
        bill.payBill();
        return new BillResponseDTO(bill);
    }

    @Transactional
    public BillResponseDTO cancelBill(Long id){
        Bill bill = billValidation.validateBill(id, BillAction.CANCEL);
        bill.cancelBill();
        return new BillResponseDTO(bill);
    }

}
