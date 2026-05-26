package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.product.ProductResponseDTO;
import org.uorderflow.dto.product.ProductUpdateDTO;
import org.uorderflow.service.product.ProductService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/foods")
public class ProductController {

    @Autowired
    ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(@RequestBody @Valid ProductCreateDTO data, UriComponentsBuilder builder){
        ProductResponseDTO product = productService.create(data);
        URI uri = builder.path("/{id}").buildAndExpand(product.id()).toUri();
        return ResponseEntity.created(uri).body(product);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> findAll(){
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(productService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(@PathVariable Long id, @RequestBody @Valid ProductUpdateDTO data){
        return ResponseEntity.ok(productService.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> reactivate(@PathVariable Long id){
        return ResponseEntity.ok(productService.reactivate(id));
    }
}
