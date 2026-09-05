package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.product.ProductDetailsResponseDTO;
import org.uorderflow.dto.product.ProductSummaryResponseDTO;
import org.uorderflow.dto.product.ProductUpdateDTO;
import org.uorderflow.service.product.ProductService;

import java.net.URI;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }


    @PostMapping
    public ResponseEntity<ProductDetailsResponseDTO> create(@RequestBody @Valid ProductCreateDTO data, UriComponentsBuilder builder){
        ProductDetailsResponseDTO product = productService.create(data);
        URI uri = builder.replacePath("/api/products/{id}").buildAndExpand(product.id()).toUri();
        return ResponseEntity.created(uri).body(product);
    }

    @GetMapping
    public ResponseEntity<Page<ProductSummaryResponseDTO>> findAll(@PageableDefault(page = 0, size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable){
        return ResponseEntity.ok(productService.findAll(pageable));
    }

    @GetMapping("/deleted")
    public ResponseEntity<Page<ProductSummaryResponseDTO>> findAllDeleted(@PageableDefault(page = 0, size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable){
        return ResponseEntity.ok(productService.findAllDeleted(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductSummaryResponseDTO>> searchAllByName(@RequestParam String name,
                                                                           @PageableDefault(page = 0, size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ){
        return ResponseEntity.ok(productService.searchAllByName(name, pageable));
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
