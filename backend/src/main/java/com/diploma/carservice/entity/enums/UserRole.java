package com.diploma.carservice.entity.enums;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;

public enum UserRole implements GrantedAuthority {
    ADMIN,
    MECHANIC,
    CLIENT;


    @Override
    public String getAuthority() {
        return this.name();
    }
}
