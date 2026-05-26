package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.uorderflow.dto.drink.DrinkCreateDTO;
import org.uorderflow.dto.drink.DrinkResponseDTO;
import org.uorderflow.dto.drink.DrinkUpdateDTO;
import org.uorderflow.service.drink.DrinkService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/drinks")
public class DrinkController {

    @Autowired DrinkService drinkService;

    @PostMapping
    public ResponseEntity<DrinkResponseDTO> create(@RequestBody @Valid DrinkCreateDTO data, UriComponentsBuilder builder){
        DrinkResponseDTO drink = drinkService.create(data);
        URI uri = builder.path("/{id}").buildAndExpand(drink.id()).toUri();
        return ResponseEntity.created(uri).body(drink);
    }

    @GetMapping
    public ResponseEntity<List<DrinkResponseDTO>> findAll(){
        return ResponseEntity.ok(drinkService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DrinkResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(drinkService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DrinkResponseDTO> update(@PathVariable Long id, @RequestBody @Valid DrinkUpdateDTO data){
        return ResponseEntity.ok(drinkService.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        drinkService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DrinkResponseDTO> reactivate(@PathVariable Long id){
        return ResponseEntity.ok(drinkService.reactivate(id));
    }
}
