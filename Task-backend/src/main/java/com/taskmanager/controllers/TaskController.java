package com.taskmanager.controllers;

import com.taskmanager.entities.Task;
import com.taskmanager.dto.TaskAssignmentDto;
import com.taskmanager.services.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'LABORER')")
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/my-tasks")
    @PreAuthorize("hasAnyRole('USER', 'LABORER', 'SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<List<Task>> getMyTasks(Principal principal) {
        String username = principal.getName();
        List<Task> tasks = taskService.getTasksForUser(username);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public Task createTask(@RequestBody Task task) {
        // The service logic we discussed will handle setting the 'assigner'
        return taskService.createTask(task);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task task) {
        try {
            Task updatedTask = taskService.updateTask(id, task);
            return ResponseEntity.ok(updatedTask);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * This patch method now automatically triggers the notification
     * because it calls taskService.updateTaskStatus.
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'LABORER')")
    public ResponseEntity<Task> patchTask(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            String newStatus = (String) updates.get("status");
            // This service call now contains the notification logic we added
            Task updatedTask = taskService.updateTaskStatus(id, newStatus);
            return ResponseEntity.ok(updatedTask);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Task> assignTask(@RequestBody TaskAssignmentDto assignmentDto) {
        Task updatedTask = taskService.assignTaskToLaborer(
                assignmentDto.getTaskId(),
                assignmentDto.getLaborerId());
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}