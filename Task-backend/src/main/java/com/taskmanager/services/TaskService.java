package com.taskmanager.services;

import com.taskmanager.entities.Task;
import com.taskmanager.entities.TaskStatus;
import com.taskmanager.entities.Laborer;
import com.taskmanager.repositories.TaskRepository;
import com.taskmanager.repositories.LaborerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private LaborerRepository laborerRepository;

    /**
     * Logic:
     * Admins/Managers see everything.
     * ROLE_USER only sees tasks assigned to their specific username.
     */
    public List<Task> getAllTasks() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isStandardUser = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));

        List<Task> allTasks = taskRepository.findAll();

        if (isStandardUser) {
            return allTasks.stream()
                    .filter(t -> t.getLaborer() != null &&
                            currentUsername.equals(t.getLaborer().getUsername()))
                    .collect(Collectors.toList());
        }
        return allTasks;
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    // Add this to TaskService.java
    public List<Task> getTasksForUser(String username) {
        return taskRepository.findByLaborer_Username(username);
    }

    /**
     * Updated: Partial Status Update with Ownership Check
     * Prevents a ROLE_USER from updating a task that isn't theirs.
     */
    @Transactional
    public Task updateTaskStatus(Long id, String status) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isStandardUser = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));

        return taskRepository.findById(id).map(task -> {
            // Security Check: If standard user, verify they own the task
            if (isStandardUser) {
                if (task.getLaborer() == null || !task.getLaborer().getUsername().equals(currentUsername)) {
                    throw new RuntimeException("Access Denied: You cannot update a task not assigned to you.");
                }
            }

            TaskStatus newStatus = TaskStatus.valueOf(status.toUpperCase());
            task.setStatus(newStatus);

            if (newStatus == TaskStatus.CANCELLED) {
                task.setLaborer(null);
            }

            return taskRepository.save(task);
        }).orElseThrow(() -> new RuntimeException("Task not found with id " + id));
    }

    @Transactional
    public Task updateTask(Long id, Task taskDetails) {
        return taskRepository.findById(id).map(task -> {
            task.setTitle(taskDetails.getTitle());
            task.setDescription(taskDetails.getDescription());
            task.setStatus(taskDetails.getStatus());
            task.setCategory(taskDetails.getCategory());
            task.setDeadline(taskDetails.getDeadline());
            task.setTime(taskDetails.getTime());
            task.setAssignerName(taskDetails.getAssignerName());
            task.setAssignerPhone(taskDetails.getAssignerPhone());

            if (taskDetails.getStatus() == TaskStatus.CANCELLED) {
                task.setLaborer(null);
            } else {
                task.setLaborer(taskDetails.getLaborer());
            }

            return taskRepository.save(task);
        }).orElseThrow(() -> new RuntimeException("Task not found with id " + id));
    }

    @Transactional
    public Task assignTaskToLaborer(Long taskId, Long laborerId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));

        if (task.getStatus() == TaskStatus.CANCELLED) {
            throw new RuntimeException("Cannot assign a laborer to a cancelled task.");
        }

        Laborer laborer = laborerRepository.findById(laborerId)
                .orElseThrow(() -> new RuntimeException("Laborer not found with ID: " + laborerId));

        task.setLaborer(laborer);
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}