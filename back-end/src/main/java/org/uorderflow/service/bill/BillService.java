package org.uorderflow.service.bill;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.bill.BillCreateDTO;
import org.uorderflow.dto.bill.BillDetailsResponseDTO;
import org.uorderflow.dto.bill.BillSummaryResponseDTO;
import org.uorderflow.dto.bill.BillUpdateDTO;
import org.uorderflow.enums.bill.BillAction;
import org.uorderflow.model.Bill;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.BillRepository;
import org.uorderflow.service.restaurantTable.RestaurantTableValidation;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final BillValidation billValidation;
    private final RestaurantTableValidation restaurantTableValidation;

    public BillService(BillRepository billRepository,
                       BillValidation billValidation,
                       RestaurantTableValidation restaurantTableValidation) {
        this.billRepository = billRepository;
        this.billValidation = billValidation;
        this.restaurantTableValidation = restaurantTableValidation;
    }

    @Transactional
    public BillDetailsResponseDTO createBill(BillCreateDTO data){
        RestaurantTable restaurantTable = restaurantTableValidation.validateRestaurantTable(data.restaurantTableId());
        Bill bill = new Bill(data, restaurantTable);
        billRepository.save(bill);
        return new BillDetailsResponseDTO(bill);
    }

    @Transactional(readOnly = true)
    public Page<BillSummaryResponseDTO> findAll(Pageable pageable){
        return billRepository.findAllPaged(pageable).map(BillSummaryResponseDTO::new);
    }

    @Transactional(readOnly = true)
    public BillDetailsResponseDTO findById(Long id){
        Bill bill = billValidation.validateBill(id, null);
        return new BillDetailsResponseDTO(bill);
    }

    @Transactional
    public BillDetailsResponseDTO update(Long id, BillUpdateDTO data){
        Bill bill = billValidation.validateBill(id, BillAction.UPDATE);
        RestaurantTable restaurantTable = null;

        if(data.restaurantTableId() != null){
            restaurantTable = restaurantTableValidation.validateRestaurantTable(data.restaurantTableId());
        }

        bill.update(data, restaurantTable);
        return new BillDetailsResponseDTO(bill);
    }

    @Transactional
    public BillDetailsResponseDTO closeBill(Long id){
        Bill bill = billValidation.validateBill(id, BillAction.CLOSE);
        bill.closeBill();
        return new BillDetailsResponseDTO(bill);
    }

    @Transactional
    public BillDetailsResponseDTO payBill(Long id){
        Bill bill = billValidation.validateBill(id, BillAction.PAY);
        bill.payBill();
        return new BillDetailsResponseDTO(bill);
    }

    @Transactional
    public BillDetailsResponseDTO cancelBill(Long id){
        Bill bill = billValidation.validateBill(id, BillAction.CANCEL);
        bill.cancelBill();
        return new BillDetailsResponseDTO(bill);
    }

}
