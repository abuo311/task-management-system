package com.taskmanager.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records")
@Data
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laborer_id", nullable = false)
    @JsonIgnoreProperties("tasks")
    private Laborer laborer;

    @Transient
    private Long laborerId;

    // This field represents the user who took/recorded the attendance
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "foreman_id")
    private User recordedBy;

    @Column(nullable = false)
    private LocalDate workDate;

    @Column(nullable = false)
    private boolean completedCoreShift = false;

    @Column(nullable = false)
    private Integer overtimeHours = 0;

    @Column(nullable = false)
    private boolean workedOvertime = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status = AttendanceStatus.PENDING;

    private LocalDateTime signedAt;

    @PrePersist
    @PreUpdate
    protected void onPreSave() {
        this.workedOvertime = (this.overtimeHours != null && this.overtimeHours > 0);
        if (this.signedAt == null) {
            this.signedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = AttendanceStatus.PENDING;
        }
    }

    public enum AttendanceStatus {
        PENDING, APPROVED, REJECTED
    }
}