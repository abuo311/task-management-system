package com.taskmanager.services;

import com.taskmanager.entities.Task;
import com.taskmanager.entities.TaskStatus;
import com.taskmanager.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskSchedulerService {

    @Autowired
    private TaskRepository taskRepository;

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void checkOverdueTasks() {
        LocalDate today = LocalDate.now();

        // Corrected: Removed LocalDate.parse() since task.getDeadline() is already a
        // LocalDate
        List<Task> activeTasks = taskRepository.findAll().stream()
                .filter(task -> task.getStatus() == TaskStatus.PENDING || task.getStatus() == TaskStatus.IN_PROGRESS)
                .filter(task -> task.getDeadline() != null && task.getDeadline().isBefore(today))
                .collect(Collectors.toList());

        if (!activeTasks.isEmpty()) {
            activeTasks.forEach(task -> task.setStatus(TaskStatus.OVERDUE));
            taskRepository.saveAll(activeTasks);
            System.out.println("Scheduler: Successfully moved " + activeTasks.size() + " tasks to OVERDUE status.");
        }
    }
}
