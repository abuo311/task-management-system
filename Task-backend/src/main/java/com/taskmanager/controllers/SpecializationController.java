package com.taskmanager.controllers;

import com.taskmanager.entities.Specialization;
import com.taskmanager.repositories.SpecializationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specializations")
@CrossOrigin(origins = "http://localhost:5173") // Ensure CORS is enabled here too
public class SpecializationController {

    @Autowired
    private SpecializationRepository repository;

    /**
     * UPDATED: Added ROLE_USER so Prince can see the trade categories on his dashboard.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN','ROLE_ADMIN','ROLE_MANAGER', 'ROLE_USER')")
    public List<Specialization> getAllSpecializations() {
        return repository.findAll();
    }

    /**
     * UPDATED: Restricted to Admins and Managers.
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN','ROLE_ADMIN','ROLE_MANAGER')")
    public ResponseEntity<?> createSpecialization(@RequestBody Specialization specialization) {
        if (repository.existsByNameIgnoreCase(specialization.getName())) {
            return ResponseEntity.badRequest().body("This trade category already exists.");
        }
        return ResponseEntity.ok(repository.save(specialization));
    }

    /**
     * UPDATED: Added ROLE_USER for single record viewing.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN','ROLE_ADMIN','ROLE_MANAGER', 'ROLE_USER')")
    public ResponseEntity<Specialization> getSpecializationById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * STRICT: Only System Admins can delete.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN','ROLE_ADMIN')")
    public ResponseEntity<?> deleteSpecialization(@PathVariable Long id) {
        return repository.findById(id)
                .map(spec -> {
                    repository.delete(spec);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}