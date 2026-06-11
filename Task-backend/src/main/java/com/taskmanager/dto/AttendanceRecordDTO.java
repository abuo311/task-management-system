package com.taskmanager.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceRecordDTO {
    private Long id;
    private boolean completedCoreShift;
    private int overtimeHours;
    private LocalDateTime signedAt;
    private String status;
    private LocalDate workDate;
    private boolean workedOvertime;
    private Long laborerId;
    private String laborerName; // Added for display
    private Long foremanId;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isCompletedCoreShift() {
        return completedCoreShift;
    }

    public void setCompletedCoreShift(boolean completedCoreShift) {
        this.completedCoreShift = completedCoreShift;
    }

    public int getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(int overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public LocalDateTime getSignedAt() {
        return signedAt;
    }

    public void setSignedAt(LocalDateTime signedAt) {
        this.signedAt = signedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public boolean isWorkedOvertime() {
        return workedOvertime;
    }

    public void setWorkedOvertime(boolean workedOvertime) {
        this.workedOvertime = workedOvertime;
    }

    public Long getLaborerId() {
        return laborerId;
    }

    public void setLaborerId(Long laborerId) {
        this.laborerId = laborerId;
    }

    public String getLaborerName() {
        return laborerName;
    }

    public void setLaborerName(String laborerName) {
        this.laborerName = laborerName;
    }

    public Long getForemanId() {
        return foremanId;
    }

    public void setForemanId(Long foremanId) {
        this.foremanId = foremanId;
    }
}