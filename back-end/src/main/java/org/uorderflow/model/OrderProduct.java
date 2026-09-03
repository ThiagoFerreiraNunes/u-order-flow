package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.*;
import org.uorderflow.dto.orderProduct.OrderProductCreateDTO;

@Table(name = "tb_order_products")
@Entity(name = "OrderProduct")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class OrderProduct {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_product_id")
    private Long id;

    @Column(name = "note")
    private String note;

    @Column(nullable = false, name = "quantity")
    private Integer quantity;

    @Column(nullable = false, precision = 6, scale = 2, name = "unit_price")
    private Double unitPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "product_id")
    private Product product;

    public OrderProduct(OrderProductCreateDTO data, Product product){
        this.note = data.note();
        this.quantity = data.quantity();
        this.unitPrice = product.getPrice();
        this.product = product;
    }
}
