package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.uorderflow.dto.product.ProductCreateDTO;
import org.uorderflow.dto.product.ProductUpdateDTO;

@Table(name = "tb_products")
@Entity(name = "Product")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @Column(nullable = false, name = "product_name")
    private String name;

    @Column(nullable = false, name = "product_description")
    private String description;

    @Column(nullable = false, name = "image_url")
    private String image;

    @Column(nullable = false, name = "price")
    private Double price;

    @Column(nullable = false, name = "is_available")
    private Boolean isAvailable;

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
    }

    public void update(ProductUpdateDTO data, ProductCategory productCategory){
        if(data.name() != null) this.name = data.name();
        if(data.description() != null) this.description = data.description();
        if(data.image() != null) this.image = data.image();
        if(data.price() != null) this.price = data.price();
        if(productCategory != null) this.productCategory = productCategory;
    }

    public void delete(){
        this.isAvailable = false;
    }

    public void reactivate(){
        this.isAvailable = true;
    }
}
