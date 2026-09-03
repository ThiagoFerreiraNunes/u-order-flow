package org.uorderflow.controller;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.uorderflow.dto.bill.BillCreateDTO;
import org.uorderflow.dto.bill.BillDetailsResponseDTO;
import org.uorderflow.dto.bill.BillSummaryResponseDTO;
import org.uorderflow.dto.bill.BillUpdateDTO;
import org.uorderflow.dto.order.OrderCreateDTO;
import org.uorderflow.dto.order.OrderDetailsResponseDTO;
import org.uorderflow.service.bill.BillService;
import org.uorderflow.service.order.OrderService;

import java.net.URI;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;
    private final OrderService orderService;

    public BillController(BillService billService,
                          OrderService orderService) {
        this.billService = billService;
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<BillDetailsResponseDTO> createBill(@RequestBody @Valid BillCreateDTO data, UriComponentsBuilder builder){
        BillDetailsResponseDTO bill = billService.createBill(data);
        URI uri = builder.replacePath("/api/bills/{id}").buildAndExpand(bill.id()).toUri();
        return ResponseEntity.created(uri).body(bill);
    }

    @PostMapping("/{billId}/orders")
    public ResponseEntity<OrderDetailsResponseDTO> createOrder(@PathVariable Long billId, @RequestBody @Valid OrderCreateDTO data, UriComponentsBuilder builder){
        OrderDetailsResponseDTO order = orderService.createOrder(billId, data);
        URI uri = builder.replacePath("/api/orders/{id}").buildAndExpand(order.id()).toUri();
        return ResponseEntity.created(uri).body(order);
    }

    @GetMapping
    public ResponseEntity<Page<BillSummaryResponseDTO>> findAll(@PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable){
        return ResponseEntity.ok(billService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDetailsResponseDTO> findById(@PathVariable Long id){
        return ResponseEntity.ok(billService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillDetailsResponseDTO> update(@PathVariable Long id, @RequestBody @Valid BillUpdateDTO data){
        return ResponseEntity.ok(billService.update(id, data));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BillDetailsResponseDTO> cancelBill(@PathVariable Long id){
        return ResponseEntity.ok(billService.cancelBill(id));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<BillDetailsResponseDTO> closeBill(@PathVariable Long id){
        return ResponseEntity.ok(billService.closeBill(id));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<BillDetailsResponseDTO> payBill(@PathVariable Long id){
        return ResponseEntity.ok(billService.payBill(id));
    }
}
