package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.product.ProductDetailsResponseDTO;
import org.uorderflow.dto.product.ProductUpdateDTO;
import org.uorderflow.service.product.ProductService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    ProductService productService;

    @PostMapping
    public ResponseEntity<ProductDetailsResponseDTO> create(@RequestBody @Valid ProductCreateDTO data, UriComponentsBuilder builder){
        ProductDetailsResponseDTO product = productService.create(data);
        URI uri = builder.replacePath("/api/products/{id}").buildAndExpand(product.id()).toUri();
        return ResponseEntity.created(uri).body(product);
    }

    @GetMapping
    public ResponseEntity<List<ProductDetailsResponseDTO>> findAll(){
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailsResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(productService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDetailsResponseDTO> update(@PathVariable Long id, @RequestBody @Valid ProductUpdateDTO data){
        return ResponseEntity.ok(productService.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductDetailsResponseDTO> reactivate(@PathVariable Long id){
        return ResponseEntity.ok(productService.reactivate(id));
    }
}
