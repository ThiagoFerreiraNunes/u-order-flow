package org.uorderflow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.product.ProductUpdateDTO;

@Table(name = "tb_products")
@Entity(name = "Product")
@Getter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Product {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @Column(nullable = false, length = 100, unique = true, name = "product_name")
    private String name;

    @Column(nullable = false, length = 255, name = "product_description")
    private String description;

    @Column(nullable = false, length = 2048, name = "image_url")
    private String image;

    @Column(nullable = false, precision = 6, scale = 2, name = "price")
    @Positive
    private Double price;

    @Column(nullable = false, name = "is_available")
    private Boolean isAvailable;

    @Column(nullable = false, name = "is_deleted")
    private Boolean isDeleted;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "category_id")
    private ProductCategory productCategory;

    public Product(ProductCreateDTO data, ProductCategory productCategory){
        this.name = data.name();
        this.description = data.description();
        this.image = data.image();
        this.price = data.price();
        this.productCategory = productCategory;
        this.isAvailable = true;
        this.isDeleted = false;
    }

    public void update(ProductUpdateDTO data, ProductCategory productCategory){
        if(data.name() != null) this.name = data.name();
        if(data.description() != null) this.description = data.description();
        if(data.image() != null) this.image = data.image();
        if(data.price() != null) this.price = data.price();
        if(productCategory != null) this.productCategory = productCategory;
        if(data.isAvailable() != null) this.isAvailable = data.isAvailable();
    }

    public void delete(){
        this.isDeleted = true;
    }

    public void reactivate(){
        this.isDeleted = false;
    }
}
