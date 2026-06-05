package com.taskmanager.repositories;

import com.taskmanager.entities.Laborer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LaborerRepository extends JpaRepository<Laborer, Long> {

    // Returns a list of laborers by their trade
    List<Laborer> findByTrade(String trade);

    // FIX: Unified to return Optional<Laborer>
    // This allows you to use .orElseThrow() in your service layer
    Optional<Laborer> findByUsername(String username);

    // Checks if a laborer exists by username
    boolean existsByUsername(String username);

    // Returns the total count of laborers
    long count();
}