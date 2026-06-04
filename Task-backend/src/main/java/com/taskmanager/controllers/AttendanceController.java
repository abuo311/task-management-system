package com.taskmanager.controllers;

import com.taskmanager.entities.AttendanceRecord;
import com.taskmanager.services.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService service;

    // Use hasAnyAuthority to check for the exact string (e.g., 'ADMIN')
    // OR use hasAnyRole if your JWT correctly adds the 'ROLE_' prefix
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public List<AttendanceRecord> getAll() {
        return service.getAllAttendance();
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<?> create(@RequestBody AttendanceRecord record) {
        try {
            AttendanceRecord saved = service.save(record);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            // This will return a 400 status to your React frontend
            // with the message: "Attendance for this laborer has already been recorded..."
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/whoami")
    // Anyone who is authenticated can check who they are
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> whoAmI(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "username", authentication.getName(),
                "roles", authentication.getAuthorities().stream()
                        .map(ga -> ga.getAuthority())
                        .collect(Collectors.toList())));
    }
}