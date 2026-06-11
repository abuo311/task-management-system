package com.taskmanager.repositories;

import com.taskmanager.entities.Laborer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LaborerRepository extends JpaRepository<Laborer, Long> {

    List<Laborer> findByTrade(String trade);

    Optional<Laborer> findByUsername(String username);

    boolean existsByUsername(String username);

    long count();

    // Added for Activity Feed
    List<Laborer> findTop5ByOrderByRegistrationDateDesc();
}