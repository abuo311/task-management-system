package com.taskmanager.services;

import com.taskmanager.entities.Task;
import com.taskmanager.entities.TaskStatus;
import com.taskmanager.entities.Laborer;
import com.taskmanager.repositories.TaskRepository;
import com.taskmanager.repositories.LaborerRepository;
import com.taskmanager.services.NotificationService;
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

    @Autowired
    private NotificationService notificationService;

    public List<Task> getAllTasks() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isStandardUser = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));

        List<Task> allTasks = taskRepository.findAllTasksWithLaborer();

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

    public List<Task> getTasksForUser(String username) {
        return taskRepository.findByLaborer_Username(username);
    }

    @Transactional
    public Task updateTaskStatus(Long id, String status) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isStandardUser = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));

        return taskRepository.findById(id).map(task -> {
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

            // Enhanced Notification Logic
            if (newStatus == TaskStatus.COMPLETED) {
                String laborerName = (task.getLaborer() != null) ? task.getLaborer().getName() : "A laborer";

                // Inside TaskService.java updateTaskStatus method:
                notificationService.createTaskCompletionNotification(
                        task,
                        "Task Completed",
                        task.getLaborer().getName() + " has completed the task: " + task.getTitle(),
                        task.getAssigner() // Assuming task.getAssigner() returns the User who assigned it
                );
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