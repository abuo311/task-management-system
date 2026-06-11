package com.taskmanager.repositories;

import com.taskmanager.entities.Task;
import com.taskmanager.entities.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    long countByStatus(TaskStatus status);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.laborer")
    List<Task> findAllTasksWithLaborer();

    List<Task> findByLaborer_Username(String username);

    long countByDeadlineBeforeAndStatusNot(LocalDate date, TaskStatus status);

    // Added for Activity Feed
    List<Task> findTop5ByOrderByUpdatedAtDesc();
}