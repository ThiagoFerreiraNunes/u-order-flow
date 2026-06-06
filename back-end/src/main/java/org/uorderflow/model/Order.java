package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.uorderflow.dto.order.OrderCreateDTO;
import org.uorderflow.dto.order.OrderUpdateDTO;
import org.uorderflow.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Table(name = "tb_orders")
@Entity(name = "Order")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    @Column(nullable = false, name = "order_status")
    private OrderStatus status;

    @Column(nullable = false, name = "is_paid")
    private Boolean isPaid;

    @Column(nullable = false, name = "cancellation_fee")
    private Boolean cancellationFee;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(nullable = false, length = 100, name = "customer_name")
    private String customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "restaurant_table_id")
    private RestaurantTable restaurantTable;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderProduct> items = new ArrayList<>();

    public Order(OrderCreateDTO data, RestaurantTable restaurantTable){
        this.status = OrderStatus.WAITING;
        this.isPaid = false;
        this.cancellationFee = false;
        this.createdAt = LocalDateTime.now();
        this.deliveredAt = null;
        this.customer = data.customer();
        this.restaurantTable = restaurantTable;
    }

    public void addItem(OrderProduct item){
        this.items.add(item);
        item.setOrder(this);
    }

    public void update(OrderUpdateDTO data, RestaurantTable restaurantTable){
        if(data.customer() != null) this.customer = data.customer();
        if(restaurantTable != null) this.restaurantTable = restaurantTable;
    }

    public void prepareOrder(){
        this.status = OrderStatus.PREPARING;
    }

    public void deliverOrder(){
        this.status = OrderStatus.DELIVERED;
        this.deliveredAt = LocalDateTime.now();
    }

    public void cancelOrder(){
        this.status = OrderStatus.CANCELLED;
    }

    public void payOrder(){
        this.isPaid = true;
    }

    public void addCancellationFee() {
        this.cancellationFee = true;
    }
}
