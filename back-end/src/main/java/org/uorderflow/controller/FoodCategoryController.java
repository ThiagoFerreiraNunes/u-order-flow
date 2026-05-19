package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.uorderflow.dto.foodCategory.FoodCategoryCreateDTO;
import org.uorderflow.dto.foodCategory.FoodCategoryResponseDTO;
import org.uorderflow.dto.foodCategory.FoodCategoryUpdateDTO;
import org.uorderflow.service.foodCategory.FoodCategoryService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/food-categories")
public class FoodCategoryController {

    @Autowired FoodCategoryService foodCategoryService;

    @PostMapping
    public ResponseEntity<FoodCategoryResponseDTO> create(@RequestBody @Valid FoodCategoryCreateDTO data, UriComponentsBuilder builder){
        FoodCategoryResponseDTO foodCategory = foodCategoryService.create(data);
        URI uri = builder.path("/{id}").buildAndExpand(foodCategory.id()).toUri();
        return ResponseEntity.created(uri).body(foodCategory);
    }

    @GetMapping
    public ResponseEntity<List<FoodCategoryResponseDTO>> findAll(){
        return ResponseEntity.ok(foodCategoryService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodCategoryResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(foodCategoryService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodCategoryResponseDTO> update(@PathVariable Long id, @RequestBody @Valid FoodCategoryUpdateDTO data){
        return ResponseEntity.ok(foodCategoryService.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        foodCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<FoodCategoryResponseDTO> reactivate(@PathVariable Long id){
        return ResponseEntity.ok(foodCategoryService.reactivate(id));
    }

}
