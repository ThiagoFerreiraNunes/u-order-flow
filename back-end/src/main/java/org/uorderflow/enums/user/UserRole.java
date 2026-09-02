package org.uorderflow.enums.user;

import lombok.Getter;

@Getter
public enum UserRole {
    ADMIN("Admin"),
    COOK("Cook"),
    WAITER("Waiter");

    private final String description;

    UserRole(String description){
        this.description = description;
    }
}
