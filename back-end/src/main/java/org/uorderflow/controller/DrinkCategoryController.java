package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.uorderflow.dto.drinkCategory.DrinkCategoryCreateDTO;
import org.uorderflow.dto.drinkCategory.DrinkCategoryResponseDTO;
import org.uorderflow.dto.drinkCategory.DrinkCategoryUpdateDTO;
import org.uorderflow.service.drinkCategory.DrinkCategoryService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/drink-categories")
public class DrinkCategoryController {
    @Autowired
    DrinkCategoryService drinkCategoryService;

    @PostMapping
    public ResponseEntity<DrinkCategoryResponseDTO> create(@RequestBody @Valid DrinkCategoryCreateDTO data, UriComponentsBuilder builder){
        DrinkCategoryResponseDTO drinkCategory = drinkCategoryService.create(data);
        URI uri = builder.path("/{id}").buildAndExpand(drinkCategory.id()).toUri();
        return ResponseEntity.created(uri).body(drinkCategory);
    }

    @GetMapping
    public ResponseEntity<List<DrinkCategoryResponseDTO>> findAll(){
        return ResponseEntity.ok(drinkCategoryService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DrinkCategoryResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(drinkCategoryService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DrinkCategoryResponseDTO> update(@PathVariable Long id, @RequestBody @Valid DrinkCategoryUpdateDTO data){
        return ResponseEntity.ok(drinkCategoryService.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        drinkCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DrinkCategoryResponseDTO> reactivate(@PathVariable Long id){
        return ResponseEntity.ok(drinkCategoryService.reactivate(id));
    }
}
