package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.uorderflow.dto.productCategory.ProductCategoryCreateDTO;
import org.uorderflow.dto.productCategory.ProductCategoryResponseDTO;
import org.uorderflow.dto.productCategory.ProductCategoryUpdateDTO;
import org.uorderflow.service.productCategory.ProductCategoryService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/product-categories")
public class ProductCategoryController {

    @Autowired
    ProductCategoryService productCategoryService;

    @PostMapping
    public ResponseEntity<ProductCategoryResponseDTO> create(@RequestBody @Valid ProductCategoryCreateDTO data, UriComponentsBuilder builder){
        ProductCategoryResponseDTO productCategory = productCategoryService.create(data);
        URI uri = builder.replacePath("/api/product-categories/{id}").buildAndExpand(productCategory.id()).toUri();
        return ResponseEntity.created(uri).body(productCategory);
    }

    @GetMapping
    public ResponseEntity<Page<ProductCategoryResponseDTO>> findAll(@PageableDefault(page = 0, size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable){
        return ResponseEntity.ok(productCategoryService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductCategoryResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(productCategoryService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductCategoryResponseDTO> update(@PathVariable Long id, @RequestBody @Valid ProductCategoryUpdateDTO data){
        return ResponseEntity.ok(productCategoryService.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        productCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductCategoryResponseDTO> reactivate(@PathVariable Long id){
        return ResponseEntity.ok(productCategoryService.reactivate(id));
    }

}
