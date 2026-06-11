package com.taskmanager.controllers;

import com.taskmanager.dto.AttendanceRecordDTO;
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

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public List<AttendanceRecordDTO> getAll() {
        // Now returns List<AttendanceRecordDTO> instead of List<AttendanceRecord>
        return service.getAllAttendance();
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SYSTEM_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<?> create(@RequestBody AttendanceRecord record) {
        try {
            AttendanceRecord saved = service.save(record);
            // Convert to DTO before sending back to React for consistency
            return ResponseEntity.ok(service.convertToDto(saved));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/whoami")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> whoAmI(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
                "username", authentication.getName(),
                "roles", authentication.getAuthorities().stream()
                        .map(ga -> ga.getAuthority())
                        .collect(Collectors.toList())));
    }
}