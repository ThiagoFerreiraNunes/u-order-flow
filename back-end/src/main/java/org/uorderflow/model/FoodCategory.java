package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.uorderflow.dto.foodCategory.FoodCategoryCreateDTO;
import org.uorderflow.dto.foodCategory.FoodCategoryUpdateDTO;

@Table(name = "tb_food_categories")
@Entity(name = "FoodCategory")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class FoodCategory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_category_id")
    private Long id;

    @Column(name = "category_name")
    private String name;

    @Column(name = "is_available")
    private Boolean isAvailable;

    public FoodCategory(FoodCategoryCreateDTO data){
        this.name = data.name();
        this.isAvailable = true;
    }

    public void update(FoodCategoryUpdateDTO data){
        if(data.name() != null) this.name = data.name();
    }

    public void delete(){
        this.isAvailable = false;
    }

    public void reactivate(){
        this.isAvailable = true;
    }
}
