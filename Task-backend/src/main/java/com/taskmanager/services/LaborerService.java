package com.taskmanager.services;

import com.taskmanager.entities.Laborer;
import com.taskmanager.repositories.LaborerRepository;
import com.taskmanager.repositories.SpecializationRepository; // Import your repo
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LaborerService {

    @Autowired
    private LaborerRepository laborerRepository;

    @Autowired
    private SpecializationRepository specializationRepository; // Added for validation

    public List<Laborer> getAllLaborers() {
        return laborerRepository.findAll();
    }

    public Optional<Laborer> getLaborerById(Long id) {
        return laborerRepository.findById(id);
    }

    /**
     * Saves a new laborer, validates the workCategory,
     * and assigns the current username.
     */
    public Laborer saveLaborer(Laborer laborer) {
        // Validate Category
        if (!specializationRepository.existsByNameIgnoreCase(laborer.getWorkCategory())) {
            throw new RuntimeException("Invalid work category: " + laborer.getWorkCategory());
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            laborer.setUsername(auth.getName());
        } else {
            laborer.setUsername("system");
        }
        return laborerRepository.save(laborer);
    }

    /**
     * Updates an existing laborer's profile with validation.
     */
    public Laborer updateLaborer(Long id, Laborer updatedLaborer) {
        // Validate Category before updating
        if (!specializationRepository.existsByNameIgnoreCase(updatedLaborer.getWorkCategory())) {
            throw new RuntimeException("Invalid work category: " + updatedLaborer.getWorkCategory());
        }

        return laborerRepository.findById(id).map(existingLaborer -> {
            existingLaborer.setName(updatedLaborer.getName());
            existingLaborer.setContactNumber(updatedLaborer.getContactNumber());
            existingLaborer.setEmploymentType(updatedLaborer.getEmploymentType());
            existingLaborer.setWorkCategory(updatedLaborer.getWorkCategory());
            existingLaborer.setHireDate(updatedLaborer.getHireDate());

            return laborerRepository.save(existingLaborer);
        }).orElseThrow(() -> new RuntimeException("Laborer not found with id: " + id));
    }

    public void deleteLaborer(Long id) {
        laborerRepository.deleteById(id);
    }
}