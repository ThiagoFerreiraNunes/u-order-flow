package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.uorderflow.dto.food.FoodCreateDTO;
import org.uorderflow.dto.food.FoodResponseDTO;
import org.uorderflow.dto.food.FoodUpdateDTO;
import org.uorderflow.service.food.FoodService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    @Autowired FoodService foodService;

    @PostMapping
    public ResponseEntity<FoodResponseDTO> create(@RequestBody @Valid FoodCreateDTO data, UriComponentsBuilder builder){
        FoodResponseDTO food = foodService.create(data);
        URI uri = builder.path("/{id}").buildAndExpand(food.id()).toUri();
        return ResponseEntity.created(uri).body(food);
    }

    @GetMapping
    public ResponseEntity<List<FoodResponseDTO>> findAll(){
        return ResponseEntity.ok(foodService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(foodService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodResponseDTO> update(@PathVariable Long id, @RequestBody @Valid FoodUpdateDTO data){
        return ResponseEntity.ok(foodService.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        foodService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<FoodResponseDTO> reactivate(@PathVariable Long id){
        return ResponseEntity.ok(foodService.reactivate(id));
    }
}
