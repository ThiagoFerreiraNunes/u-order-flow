package org.uorderflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.uorderflow.dto.drink.DrinkCreateDTO;
import org.uorderflow.dto.drink.DrinkUpdateDTO;

@Table(name = "tb_drinks")
@Entity(name = "Drink")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Drink {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "drink_id")
    private Long id;

    @Column(name = "drink_name")
    private String name;

    @Column(name = "drink_description")
    private String description;

    @Column(name = "image_url")
    private String image;

    @Column(name = "price")
    private Double price;

    @Column(name = "is_available")
    private Boolean isAvailable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drink_category_id")
    private DrinkCategory drinkCategory;

    public Drink(DrinkCreateDTO data, DrinkCategory drinkCategory){
        this.name = data.name();
        this.description = data.description();
        this.image = data.image();
        this.price = data.price();
        this.drinkCategory = drinkCategory;
    }

    public void update(DrinkUpdateDTO data, DrinkCategory drinkCategory){
        if(data.name() != null) this.name = data.name();
        if(data.description() != null) this.description = data.description();
        if(data.image() != null) this.image = data.image();
        if(data.price() != null) this.price = data.price();
        if(drinkCategory != null) this.drinkCategory = drinkCategory;
    }

    public void delete(){
        this.isAvailable = false;
    }

    public void reactivate(){
        this.isAvailable = true;
    }
}
