package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.uorderflow.dto.productCategory.ProductCategoryCreateDTO;
import org.uorderflow.dto.productCategory.ProductCategoryUpdateDTO;

@Table(name = "tb_product_categories")
@Entity(name = "ProductCategory")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ProductCategory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long id;

    @Column(nullable = false, length = 50, name = "category_name")
    private String name;

    @Column(nullable = false, name = "is_available")
    private Boolean isAvailable;

    public ProductCategory(ProductCategoryCreateDTO data){
        this.name = data.name();
        this.isAvailable = true;
    }

    public void update(ProductCategoryUpdateDTO data){
        if(data.name() != null) this.name = data.name();
    }

    public void delete(){
        this.isAvailable = false;
    }

    public void reactivate(){
        this.isAvailable = true;
    }
}
