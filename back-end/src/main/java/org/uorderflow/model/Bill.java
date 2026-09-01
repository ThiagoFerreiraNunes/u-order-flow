package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.uorderflow.dto.bill.BillCreateDTO;
import org.uorderflow.dto.bill.BillUpdateDTO;
import org.uorderflow.enums.bill.BillStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Table(name = "tb_bills")
@Entity(name = "Bill")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Bill {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bill_id")
    private Long id;

    @Column(nullable = false, length = 100, name = "customer_name")
    private String customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "bill_status")
    private BillStatus status;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "restaurant_table_id")
    private RestaurantTable restaurantTable;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    public Bill(BillCreateDTO data, RestaurantTable restaurantTable){
        this.customer = data.customer();
        this.status = BillStatus.OPEN;
        this.createdAt = LocalDateTime.now();
        this.restaurantTable = restaurantTable;
    }

    public void update(BillUpdateDTO data, RestaurantTable restaurantTable){
        if(data.customer() != null) this.customer = data.customer();
        if(restaurantTable != null) this.restaurantTable = restaurantTable;
    }

    public void addOrder(Order order){
        this.orders.add(order);
        order.setBill(this);
    }

    public void closeBill(){
        this.status = BillStatus.CLOSED;
    }

    public void payBill(){
        this.status = BillStatus.PAID;
        this.paidAt = LocalDateTime.now();
    }

    public void cancelBill() {
        this.status = BillStatus.CANCELLED;
    }

}
