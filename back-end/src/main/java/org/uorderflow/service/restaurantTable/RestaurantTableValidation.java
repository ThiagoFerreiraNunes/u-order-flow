package org.uorderflow.service.restaurantTable;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Component;
import org.uorderflow.enums.bill.BillStatus;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.BillRepository;
import org.uorderflow.repository.RestaurantTableRepository;

@Component
public class RestaurantTableValidation {

    private final RestaurantTableRepository restaurantTableRepository;
    private final BillRepository billRepository;

    public RestaurantTableValidation(RestaurantTableRepository restaurantTableRepository,
                                     BillRepository billRepository) {
        this.restaurantTableRepository = restaurantTableRepository;
        this.billRepository = billRepository;
    }

    public RestaurantTable validateRestaurantTable(Long id) {
        RestaurantTable restaurantTable = restaurantTableRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RestaurantTable not found with id " + id + "."));

        return restaurantTable;
    }

    public void validateTableDeletion(Long tableId) {
        if (billRepository.existsByRestaurantTableIdAndStatus(tableId, BillStatus.OPEN)) {
            throw new BusinessRuleException("Cannot delete a restaurant table while there is an open bill linked to it.");
        }
    }
}
