package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.uorderflow.dto.food.FoodCreateDTO;
import org.uorderflow.dto.food.FoodUpdateDTO;

@Table(name = "tb_foods")
@Entity(name = "Food")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Food {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "food_id")
    private Long id;

    @Column(name = "food_name")
    private String name;

    @Column(name = "food_description")
    private String description;

    @Column(name = "image_url")
    private String image;

    @Column(name = "price")
    private Double price;

    @Column(name = "is_available")
    private Boolean isAvailable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_category_id")
    private ProductCategory foodCategory;

    public Food(FoodCreateDTO data, ProductCategory foodCategory){
        this.name = data.name();
        this.description = data.description();
        this.image = data.image();
        this.price = data.price();
        this.foodCategory = foodCategory;
        this.isAvailable = true;
    }

    public void update(FoodUpdateDTO data, ProductCategory foodCategory){
        if(data.name() != null) this.name = data.name();
        if(data.description() != null) this.description = data.description();
        if(data.image() != null) this.image = data.image();
        if(data.price() != null) this.price = data.price();
        if(foodCategory != null) this.foodCategory = foodCategory;
    }

    public void delete(){
        this.isAvailable = false;
    }

    public void reactivate(){
        this.isAvailable = true;
    }
}
