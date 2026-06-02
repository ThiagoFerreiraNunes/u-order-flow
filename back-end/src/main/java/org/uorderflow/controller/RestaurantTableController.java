package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.uorderflow.dto.restaurantTable.RestaurantTableCreateDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableResponseDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableUpdateDTO;
import org.uorderflow.service.table.RestaurantTableService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/restaurant-tables")
public class RestaurantTableController {

    @Autowired RestaurantTableService restaurantTableService;

    @PostMapping
    public ResponseEntity<RestaurantTableResponseDTO> create(@RequestBody @Valid RestaurantTableCreateDTO data, UriComponentsBuilder builder){
        RestaurantTableResponseDTO restaurantTable = restaurantTableService.create(data);
        URI uri = builder.path("/{id}").buildAndExpand(restaurantTable.id()).toUri();
        return ResponseEntity.created(uri).body(restaurantTable);
    }

    @GetMapping
    public ResponseEntity<List<RestaurantTableResponseDTO>> findAll(){
        return ResponseEntity.ok(restaurantTableService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTableResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(restaurantTableService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTableResponseDTO> update(@PathVariable Long id, @RequestBody @Valid RestaurantTableUpdateDTO data){
        return ResponseEntity.ok(restaurantTableService.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        restaurantTableService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RestaurantTableResponseDTO> reactivate(@PathVariable Long id){
        return ResponseEntity.ok(restaurantTableService.reactivate(id));
    }
}
