package com.taskmanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

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

    @JsonProperty("assignerName")
    @Column(name = "assigner_name")
    private String assignerName;

    @JsonProperty("assignerPhone")
    @Column(name = "assigner_phone")
    private String assignerPhone;

    private LocalTime time;

    private LocalDateTime updatedAt;

    private String category;

    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laborer_id")
    @JsonIgnoreProperties({ "tasks", "handler", "hibernateLazyInitializer" })
    private Laborer laborer;

    // Added relationship to the User (Manager) who assigns the task
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigner_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User assigner;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}