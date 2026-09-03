package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.uorderflow.dto.productCategory.ProductCategoryCreateDTO;
import org.uorderflow.dto.productCategory.ProductCategoryUpdateDTO;

@Table(name = "tb_product_categories")
@Entity(name = "ProductCategory")
@Getter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class ProductCategory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long id;

    @Column(nullable = false, length = 50, name = "category_name")
    private String name;

    @Column(nullable = false, name = "is_deleted")
    private Boolean isDeleted;

    public ProductCategory(ProductCategoryCreateDTO data){
        this.name = data.name();
        this.isDeleted = false;
    }

    public void update(ProductCategoryUpdateDTO data){
        if(data.name() != null) this.name = data.name();
    }

    public void delete(){
        this.isDeleted = true;
    }

    public void reactivate(){
        this.isDeleted = false;
    }
}
