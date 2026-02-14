package com.diploma.carservice.controller;

import com.diploma.carservice.entity.InventoryPart;
import com.diploma.carservice.service.InventoryPartService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryPartController {

    private final InventoryPartService service;

    public InventoryPartController(InventoryPartService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public List<InventoryPart> getAllInventoryParts(@RequestParam(required = false) String search) {
        return service.getAllParts(search);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public InventoryPart addPart(@RequestBody InventoryPart part) {
        return service.addPart(part);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public InventoryPart updatePart(@PathVariable Long id, @RequestBody InventoryPart part) {
        return service.updatePart(id, part);
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MECHANIC')")
    public InventoryPart addStock(@PathVariable Long id, @RequestParam int amount) {
        return service.updateStock(id, amount);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void delete(@PathVariable Long id) {
        service.deletePart(id);
    }
}
