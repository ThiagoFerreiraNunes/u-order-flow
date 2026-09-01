package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.uorderflow.dto.order.OrderCreateDTO;
import org.uorderflow.dto.order.OrderUpdateDTO;
import org.uorderflow.enums.order.OrderStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Table(name = "tb_orders")
@Entity(name = "Order")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "order_status")
    private OrderStatus status;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "restaurant_table_id")
    private RestaurantTable restaurantTable;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderProduct> items = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "bill_id")
    private Bill bill;

    public Order(OrderCreateDTO data, RestaurantTable restaurantTable){
        this.status = OrderStatus.WAITING;
        this.createdAt = LocalDateTime.now();
        this.deliveredAt = null;
        this.restaurantTable = restaurantTable;
    }

    public void addItem(OrderProduct item){
        this.items.add(item);
        item.setOrder(this);
    }

    public void update(OrderUpdateDTO data, RestaurantTable restaurantTable){
        if(restaurantTable != null) this.restaurantTable = restaurantTable;
    }

    public void cancelOrder(){
        this.status = OrderStatus.CANCELLED;
    }

    public void prepareOrder(){
        this.status = OrderStatus.PREPARING;
    }

    public void deliverOrder(){
        this.status = OrderStatus.DELIVERED;
        this.deliveredAt = LocalDateTime.now();
    }


}
