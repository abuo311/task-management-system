package com.taskmanager.repositories;

import com.taskmanager.entities.Laborer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LaborerRepository extends JpaRepository<Laborer, Long> {
    
    // Change findBySpecialization to findByTrade
    List<Laborer> findByTrade(String trade);
    long count();
    
    // You can also add this if you ever need to find a laborer by their username
    Laborer findByUsername(String username);
}