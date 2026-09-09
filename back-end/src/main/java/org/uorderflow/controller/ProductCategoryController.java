package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.uorderflow.dto.productCategory.ProductCategoryCreateDTO;
import org.uorderflow.dto.productCategory.ProductCategoryResponseDTO;
import org.uorderflow.dto.productCategory.ProductCategoryUpdateDTO;
import org.uorderflow.service.productCategory.ProductCategoryService;

import java.net.URI;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/product-categories")
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    public ProductCategoryController(ProductCategoryService productCategoryService){
        this.productCategoryService = productCategoryService;
    }

    @PostMapping
    public ResponseEntity<ProductCategoryResponseDTO> create(@RequestBody @Valid ProductCategoryCreateDTO data, UriComponentsBuilder builder){
        ProductCategoryResponseDTO productCategory = productCategoryService.create(data);
        URI uri = builder.replacePath("/api/product-categories/{id}").buildAndExpand(productCategory.id()).toUri();
        return ResponseEntity.created(uri).body(productCategory);
    }

    @GetMapping
    public ResponseEntity<List<ProductCategoryResponseDTO>> findAll(
            @RequestParam(name = "is-deleted", defaultValue = "false") boolean isDeleted,
            Authentication authentication
    ){
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(role -> Objects.equals(role.getAuthority(), "ADMIN"));

        return ResponseEntity.ok(productCategoryService.findAll(isDeleted, isAdmin));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductCategoryResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(productCategoryService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductCategoryResponseDTO> update(@PathVariable Long id, @RequestBody @Valid ProductCategoryUpdateDTO data){
        return ResponseEntity.ok(productCategoryService.update(id, data));
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        productCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<ProductCategoryResponseDTO> reactivate(@PathVariable Long id){
        return ResponseEntity.ok(productCategoryService.reactivate(id));
    }

}
