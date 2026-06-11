package com.taskmanager.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String message;

    // Link to the task
    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;

    // The user (manager) who should receive this
    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

    // Optional: The laborer who sent it
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private Laborer sender;

    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}