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
import org.uorderflow.dto.bill.BillCreateDTO;
import org.uorderflow.dto.bill.BillResponseDTO;
import org.uorderflow.dto.bill.BillUpdateDTO;
import org.uorderflow.dto.order.OrderCreateDTO;
import org.uorderflow.dto.order.OrderDetailsResponseDTO;
import org.uorderflow.service.bill.BillService;
import org.uorderflow.service.order.OrderService;

import java.net.URI;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired BillService billService;
    @Autowired OrderService orderService;

    @PostMapping
    public ResponseEntity<BillResponseDTO> createBill(@RequestBody @Valid BillCreateDTO data, UriComponentsBuilder builder){
        BillResponseDTO bill = billService.createBill(data);
        URI uri = builder.path("/{id}").buildAndExpand(bill.id()).toUri();
        return ResponseEntity.created(uri).body(bill);
    }

    @PostMapping("/{billId}/orders")
    public ResponseEntity<OrderDetailsResponseDTO> createOrder(@PathVariable Long billId, @RequestBody @Valid OrderCreateDTO data, UriComponentsBuilder builder){
        OrderDetailsResponseDTO order = orderService.createOrder(billId, data);
        URI uri = builder.replacePath("/api/orders/{id}").buildAndExpand(order.id()).toUri();
        return ResponseEntity.created(uri).body(order);
    }

    @GetMapping
    public ResponseEntity<Page<BillResponseDTO>> findAll(@PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable){
        return ResponseEntity.ok(billService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(billService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillResponseDTO> update(@PathVariable Long id, @RequestBody @Valid BillUpdateDTO data){
        return ResponseEntity.ok(billService.update(id, data));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BillResponseDTO> cancelBill(@PathVariable Long id){
        return ResponseEntity.ok(billService.cancelBill(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BillResponseDTO> closeBill(@PathVariable Long id){
        return ResponseEntity.ok(billService.closeBill(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BillResponseDTO> payBill(@PathVariable Long id){
        return ResponseEntity.ok(billService.payBill(id));
    }
}
