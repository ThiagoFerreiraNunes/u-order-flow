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
import org.uorderflow.dto.order.OrderCreateDTO;
import org.uorderflow.dto.order.OrderDetailsResponseDTO;
import org.uorderflow.dto.order.OrderSummaryResponseDTO;
import org.uorderflow.dto.order.OrderUpdateDTO;
import org.uorderflow.service.order.OrderService;

import java.net.URI;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDetailsResponseDTO> create(@RequestBody @Valid OrderCreateDTO data, UriComponentsBuilder builder){
        OrderDetailsResponseDTO order = orderService.create(data);
        URI uri = builder.path("/{id}").buildAndExpand(order.id()).toUri();
        return ResponseEntity.created(uri).body(order);
    }

    @GetMapping
    public ResponseEntity<Page<OrderSummaryResponseDTO>> findAll(
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ){
        return ResponseEntity.ok(orderService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailsResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(orderService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDetailsResponseDTO> update(@PathVariable Long id, @RequestBody @Valid OrderUpdateDTO data){
        return ResponseEntity.ok(orderService.update(id, data));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<OrderDetailsResponseDTO> prepareOrder(@PathVariable Long id){
        return ResponseEntity.ok(orderService.prepareOrder(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<OrderDetailsResponseDTO> deliverOrder(@PathVariable Long id){
        return ResponseEntity.ok(orderService.deliverOrder(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<OrderDetailsResponseDTO> cancelOrder(@PathVariable Long id){
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<OrderDetailsResponseDTO> payOrder(@PathVariable Long id){
        return ResponseEntity.ok(orderService.payOrder(id));
    }
}
