package com.taskmanager.repositories;

import com.taskmanager.entities.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpecializationRepository extends JpaRepository<Specialization, Long> {
    // Add this to check if a trade name already exists (case-insensitive)
    boolean existsByNameIgnoreCase(String name);
}