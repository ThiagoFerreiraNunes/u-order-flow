package org.uorderflow.enums;

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
