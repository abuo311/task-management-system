package com.taskmanager.repositories;

import com.taskmanager.entities.Task;
import com.taskmanager.entities.TaskStatus; // Import your Enum
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;  

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // Change this from String to TaskStatus
    long countByStatus(TaskStatus status);
    // In TaskRepository.java

// Add this to TaskRepository.java
List<Task> findByLaborer_Username(String username);
long countByDeadlineBeforeAndStatusNot(LocalDate date, TaskStatus status);
}