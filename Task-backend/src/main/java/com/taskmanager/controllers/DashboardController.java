package com.taskmanager.controllers;

import com.taskmanager.entities.TaskStatus; // Import your Enum
import com.taskmanager.repositories.TaskRepository;
import com.taskmanager.repositories.UserRepository;
import com.taskmanager.repositories.LaborerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LaborerRepository laborerRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'LABORER')")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        
        // --- Task Metrics ---
        // FIX: Using Enum constants instead of Strings to avoid QueryArgumentException
        stats.put("totalTasks", taskRepository.count());
        stats.put("pending", taskRepository.countByStatus(TaskStatus.PENDING));
        stats.put("progress", taskRepository.countByStatus(TaskStatus.IN_PROGRESS));
        stats.put("completed", taskRepository.countByStatus(TaskStatus.COMPLETED));
        
        /**
         * SMART OVERDUE LOGIC:
         * FIX: Pass TaskStatus.COMPLETED instead of "COMPLETED"
         */
        stats.put("overdue", taskRepository.countByDeadlineBeforeAndStatusNot(
            LocalDate.now(), 
            TaskStatus.COMPLETED
        ));
        
        // --- Resource Metrics ---
        stats.put("totalUsers", userRepository.count());
        stats.put("totalLaborers", laborerRepository.count());

        return ResponseEntity.ok(stats);
    }
}