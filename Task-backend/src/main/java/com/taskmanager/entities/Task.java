package com.taskmanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime; // Added for timestamping

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    private LocalDate deadline;

    @Column(name = "assigner_name")
    private String assignerName;

    @Column(name = "assigner_phone")
    private String assignerPhone;

    // Matches your React time field
    private LocalTime time;

    // Tracks when the task was last modified (e.g., bulk completed)
    private LocalDateTime updatedAt;

    private String category; // e.g., Site Preparation, Finishing

    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY) // Changed from EAGER
    @JoinColumn(name = "laborer_id")
    @JsonIgnoreProperties({ "tasks", "handler", "hibernateLazyInitializer" })
    private Laborer laborer;

    // Automatically set the timestamp before updating
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
