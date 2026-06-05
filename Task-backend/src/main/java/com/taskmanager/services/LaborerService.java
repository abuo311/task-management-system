package com.taskmanager.services;

import com.taskmanager.entities.Laborer;
import com.taskmanager.repositories.LaborerRepository;
import com.taskmanager.repositories.SpecializationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LaborerService {

    @Autowired
    private LaborerRepository laborerRepository;

    @Autowired
    private SpecializationRepository specializationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Laborer> getAllLaborers() {
        return laborerRepository.findAll();
    }

    public Optional<Laborer> getLaborerById(Long id) {
        return laborerRepository.findById(id);
    }

    /**
     * Saves a new laborer with validation and secure password hashing.
     */
    public Laborer saveLaborer(Laborer laborer) {
        // 1. Check for duplicate username
        if (laborerRepository.existsByUsername(laborer.getUsername())) {
            throw new RuntimeException("Laborer with username " + laborer.getUsername() + " already exists.");
        }

        // 2. Validate Category (Directly use the String value)
        if (laborer.getWorkCategory() == null ||
                !specializationRepository.existsByNameIgnoreCase(laborer.getWorkCategory())) {
            throw new RuntimeException("Invalid or missing work category.");
        }

        // 3. MANDATORY Password Encryption
        if (laborer.getPassword() == null || laborer.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required for new laborer.");
        }
        laborer.setPassword(passwordEncoder.encode(laborer.getPassword()));

        return laborerRepository.save(laborer);
    }

    /**
     * Updates an existing laborer's profile with validation.
     */
    public Laborer updateLaborer(Long id, Laborer updatedLaborer) {
        // Validate Category (Directly use the String value)
        if (updatedLaborer.getWorkCategory() == null ||
                !specializationRepository.existsByNameIgnoreCase(updatedLaborer.getWorkCategory())) {
            throw new RuntimeException("Invalid or missing work category.");
        }

        return laborerRepository.findById(id).map(existingLaborer -> {
            existingLaborer.setName(updatedLaborer.getName());
            existingLaborer.setContactNumber(updatedLaborer.getContactNumber());
            existingLaborer.setEmploymentType(updatedLaborer.getEmploymentType());
            existingLaborer.setWorkCategory(updatedLaborer.getWorkCategory());
            existingLaborer.setHireDate(updatedLaborer.getHireDate());

            // Update password only if a new one is provided
            if (updatedLaborer.getPassword() != null && !updatedLaborer.getPassword().trim().isEmpty()) {
                existingLaborer.setPassword(passwordEncoder.encode(updatedLaborer.getPassword()));
            }

            return laborerRepository.save(existingLaborer);
        }).orElseThrow(() -> new RuntimeException("Laborer not found with id: " + id));
    }

    public void deleteLaborer(Long id) {
        laborerRepository.deleteById(id);
    }
}