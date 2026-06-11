package com.taskmanager.controllers;

import com.taskmanager.dto.ActivityDTO;
import com.taskmanager.repositories.TaskRepository;
import com.taskmanager.repositories.LaborerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityController {

        @Autowired
        private TaskRepository taskRepository;

        @Autowired
        private LaborerRepository laborerRepository;

        @GetMapping
        @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_LABORER')")
        public List<ActivityDTO> getRecentActivities() {
                List<ActivityDTO> activities = new ArrayList<>();

                // Add Recent Tasks with null check
                taskRepository.findTop5ByOrderByUpdatedAtDesc()
                                .forEach(task -> activities.add(new ActivityDTO(
                                                task.getId(),
                                                "Task updated: " + task.getTitle(),
                                                task.getUpdatedAt() != null ? task.getUpdatedAt()
                                                                : LocalDateTime.now())));

                // Add Recent Laborers with null check
                laborerRepository.findTop5ByOrderByRegistrationDateDesc()
                                .forEach(l -> activities.add(new ActivityDTO(
                                                l.getId(),
                                                "New laborer: " + l.getName(),
                                                l.getRegistrationDate() != null ? l.getRegistrationDate().atStartOfDay()
                                                                : LocalDateTime.now())));

                // Sort by date descending, putting nulls at the end
                return activities.stream()
                                .sorted(Comparator.comparing(ActivityDTO::createdAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .collect(Collectors.toList());
        }
}