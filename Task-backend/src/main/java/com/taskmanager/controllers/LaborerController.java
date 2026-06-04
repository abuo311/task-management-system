package com.taskmanager.controllers;

import com.taskmanager.entities.Laborer;
import com.taskmanager.services.LaborerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laborers")
public class LaborerController {

    @Autowired
    private LaborerService laborerService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER')")
    public List<Laborer> getAllLaborers() {
        return laborerService.getAllLaborers();
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Laborer> addLaborer(@RequestBody Laborer laborer) {
        // Validation: Ensure the object is not null
        if (laborer == null) {
            return ResponseEntity.badRequest().build();
        }
        Laborer savedLaborer = laborerService.saveLaborer(laborer);
        return ResponseEntity.ok(savedLaborer);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER')")
    public ResponseEntity<Laborer> getLaborer(@PathVariable Long id) {
        return laborerService.getLaborerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Laborer> updateLaborer(@PathVariable Long id, @RequestBody Laborer laborerDetails) {
        try {
            // Service handles the logic of mapping new fields to the existing record
            Laborer updatedLaborer = laborerService.updateLaborer(id, laborerDetails);
            return ResponseEntity.ok(updatedLaborer);
        } catch (RuntimeException e) {
            // Returns 404 if the ID doesn't exist
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Returns 500 for other issues (like constraint violations)
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Void> deleteLaborer(@PathVariable Long id) {
        try {
            laborerService.deleteLaborer(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}