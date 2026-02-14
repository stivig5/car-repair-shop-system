package com.diploma.carservice.service;

import com.diploma.carservice.entity.InventoryPart;
import com.diploma.carservice.repository.InventoryPartRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryPartService {
    private final InventoryPartRepository partRepository;

    public InventoryPartService(InventoryPartRepository partRepository) {
        this.partRepository = partRepository;
    }

    public List<InventoryPart> getAllParts(String search) {
        return partRepository.searchParts(search);
    }

    public InventoryPart addPart(InventoryPart part) {
        if (part.getMinQuantity() == null) {
            part.setMinQuantity(5);
        }

        return partRepository.save(part);
    }

    public InventoryPart updatePart(Long id, InventoryPart partDetails) {
        InventoryPart part = partRepository.findById(id).orElseThrow(() -> new RuntimeException("Part not found"));
        part.setName(partDetails.getName());
        part.setSerialNumber(partDetails.getSerialNumber());
        part.setPrice(partDetails.getPrice());
        part.setQuantityInStock(partDetails.getQuantityInStock());
        if (partDetails.getMinQuantity() != null) {
            part.setMinQuantity(partDetails.getMinQuantity());
        }

        return partRepository.save(part);
    }

    public InventoryPart updateStock(Long id, int quantityToAdd) {
        InventoryPart part = partRepository.findById(id).orElseThrow(() -> new RuntimeException("Part not found"));
        part.setQuantityInStock(part.getQuantityInStock() + quantityToAdd);
        return partRepository.save(part);
    }

    public void decreaseStock(Long id, int quantity) {
        InventoryPart part = partRepository.findById(id).orElseThrow(() -> new RuntimeException("Part not found"));
        if (part.getQuantityInStock() < quantity) {
            throw new RuntimeException("Not enough parts in stock");
        }
        part.setQuantityInStock(part.getQuantityInStock() - quantity);
        partRepository.save(part);
    }

    public void deletePart(Long id) {
        partRepository.deleteById(id);
    }
}
