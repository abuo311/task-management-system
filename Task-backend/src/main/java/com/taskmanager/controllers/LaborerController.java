package com.taskmanager.controllers;

import com.taskmanager.entities.Laborer;
import com.taskmanager.services.LaborerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> addLaborer(@RequestBody Laborer laborer) {
        if (laborer == null || laborer.getUsername() == null) {
            return ResponseEntity.badRequest().body("Username is required.");
        }

        try {
            Laborer savedLaborer = laborerService.saveLaborer(laborer);
            return ResponseEntity.ok(savedLaborer);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
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
    public ResponseEntity<?> updateLaborer(@PathVariable Long id, @RequestBody Laborer laborerDetails) {
        try {
            Laborer updatedLaborer = laborerService.updateLaborer(id, laborerDetails);
            return ResponseEntity.ok(updatedLaborer);
        } catch (RuntimeException e) {
            // This catches "Laborer not found" and "Invalid category"
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
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