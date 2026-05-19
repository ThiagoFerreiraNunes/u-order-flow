package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.uorderflow.dto.drinkCategory.DrinkCategoryCreateDTO;
import org.uorderflow.dto.drinkCategory.DrinkCategoryUpdateDTO;

@Table(name = "tb_drink_categories")
@Entity(name = "DrinkCategory")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class DrinkCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "drink_category_id")
    private Long id;

    @Column(name = "category_name")
    private String name;

    @Column(name = "is_available")
    private Boolean isAvailable;

    public DrinkCategory(DrinkCategoryCreateDTO data){
        this.name = data.name();
        this.isAvailable = true;
    }

    public void update(DrinkCategoryUpdateDTO data){
        if(data.name() != null) this.name = data.name();
    }

    public void delete(){
        this.isAvailable = false;
    }

    public void reactivate(){
        this.isAvailable = true;
    }

}
