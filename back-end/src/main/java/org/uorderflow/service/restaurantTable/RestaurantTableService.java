package org.uorderflow.service.restaurantTable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uorderflow.dto.restaurantTable.RestaurantTableCreateDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableResponseDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableUpdateDTO;
import org.uorderflow.infra.exception.BusinessRuleException;
import org.uorderflow.model.RestaurantTable;
import org.uorderflow.repository.RestaurantTableRepository;

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
        if(restaurantTableRepository.existsByNumber(data.number())){
            throw new BusinessRuleException("A RestaurantTable with the number '" + data.number() + "' already exists");
        }

        RestaurantTable restaurantTable = new RestaurantTable(data);
        restaurantTableRepository.save(restaurantTable);
        return new RestaurantTableResponseDTO(restaurantTable);
    }

    @Transactional(readOnly = true)
    public List<RestaurantTableResponseDTO> findAll(){
        return restaurantTableRepository.findAllSorted().stream()
                .map(RestaurantTableResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public RestaurantTableResponseDTO findById(Long id){
        RestaurantTable restaurantTable = restaurantTableValidation.validateRestaurantTable(id);
        return new RestaurantTableResponseDTO(restaurantTable);
    }

    @Transactional
    public RestaurantTableResponseDTO update(Long id, RestaurantTableUpdateDTO data){
        RestaurantTable restaurantTable = restaurantTableValidation.validateRestaurantTable(id);

        if(data.number() != null && !data.number().equals(restaurantTable.getNumber())){
            boolean numberExists = restaurantTableRepository.existsByNumberAndIdNot(data.number(), id);
            if (numberExists) {
                throw new BusinessRuleException("A RestaurantTable with the number '" + data.number() + "' already exists");
            }
        }

        restaurantTable.update(data);
        return new RestaurantTableResponseDTO(restaurantTable);
    }

    @Transactional
    public void delete(Long id){
        RestaurantTable restaurantTable = restaurantTableValidation.validateRestaurantTable(id);
        restaurantTableValidation.validateTableDeletion(id);
        restaurantTable.delete();
    }
}
