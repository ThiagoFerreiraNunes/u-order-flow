package org.uorderflow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.uorderflow.dto.restaurantTable.RestaurantTableCreateDTO;
import org.uorderflow.dto.restaurantTable.RestaurantTableUpdateDTO;

@Table(name = "tb_restaurant_tables")
@Entity(name = "RestaurantTable")
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantTable {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "restaurant_table_id")
    private Long id;

    @Column(nullable = false, name = "restaurant_table_number")
    @Positive
    private Integer number;

    @Column(nullable = false, name = "is_available")
    private Boolean isAvailable;

    public RestaurantTable(RestaurantTableCreateDTO data){
        this.number = data.number();
    }

    public void update(RestaurantTableUpdateDTO data){
        if(data.number() != null) this.number = data.number();
    }

    public void delete(){
        this.isAvailable = false;
    }

    public void reactivate(){
        this.isAvailable = true;
    }
}
