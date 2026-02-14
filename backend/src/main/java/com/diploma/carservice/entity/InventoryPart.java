package com.diploma.carservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "inventory_parts")
@Data
public class InventoryPart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String serialNumber;

    @Column(name = "quantity_in_stock")
    private Integer quantityInStock;

    @Column(name = "min_quantity")
    private Integer minQuantity = 5;

    private BigDecimal price;
}
