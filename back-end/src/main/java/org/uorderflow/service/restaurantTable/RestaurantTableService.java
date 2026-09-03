package org.uorderflow.service.restaurantTable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.restaurantTable.RestaurantTableCreateDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableResponseDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableUpdateDTO;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.RestaurantTableRepository;
import org.uorderflow.enums.generic.ValidateAction;

import java.util.List;

@Service
public class RestaurantTableService {

    private final RestaurantTableRepository restaurantTableRepository;
    private final RestaurantTableValidation restaurantTableValidation;

    public RestaurantTableService(RestaurantTableRepository restaurantTableRepository,
                                  RestaurantTableValidation restaurantTableValidation) {
        this.restaurantTableRepository = restaurantTableRepository;
        this.restaurantTableValidation = restaurantTableValidation;
    }

    @Transactional
    public RestaurantTableResponseDTO create(RestaurantTableCreateDTO data){
        RestaurantTable restaurantTable = new RestaurantTable(data);
        restaurantTableRepository.save(restaurantTable);
        return new RestaurantTableResponseDTO(restaurantTable);
    }

    @Transactional(readOnly = true)
    public List<RestaurantTableResponseDTO> findAll(){
        return restaurantTableRepository.findAllByNotDeletedAndSortByNumber().stream().map(RestaurantTableResponseDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public RestaurantTableResponseDTO findById(Long id){
        RestaurantTable restaurantTable = restaurantTableValidation.validateRestaurantTable(id, ValidateAction.ACTIVE_CHECK);
        return new RestaurantTableResponseDTO(restaurantTable);
    }

    @Transactional
    public RestaurantTableResponseDTO update(Long id, RestaurantTableUpdateDTO data){
        RestaurantTable restaurantTable = restaurantTableValidation.validateRestaurantTable(id, ValidateAction.ACTIVE_CHECK);
        restaurantTable.update(data);
        return new RestaurantTableResponseDTO(restaurantTable);
    }

    @Transactional
    public void delete(Long id){
        RestaurantTable restaurantTable = restaurantTableValidation.validateRestaurantTable(id, ValidateAction.DELETE);
        restaurantTable.delete();
    }

    @Transactional
    public RestaurantTableResponseDTO reactivate(Long id){
        RestaurantTable restaurantTable = restaurantTableValidation.validateRestaurantTable(id, ValidateAction.REACTIVATE);
        restaurantTable.reactivate();
        return new RestaurantTableResponseDTO(restaurantTable);
    }
}
