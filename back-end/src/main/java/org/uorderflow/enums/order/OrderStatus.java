package org.uorderflow.enums.order;

import lombok.Getter;

@Getter
public enum OrderStatus {
    WAITING("Awaiting preparation"),
    PREPARING("Preparing"),
    DELIVERED("Delivered"),
    CANCELLED("Cancelled");

    private final String description;

    OrderStatus(String description){
        this.description = description;
    }
}
