package com.taskmanager.entities;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum TaskStatus {
    PENDING, IN_PROGRESS, COMPLETED, OVERDUE, CANCELLED;

    @JsonCreator
    public static TaskStatus fromString(String value) {
        for (TaskStatus status : TaskStatus.values()) {
            if (status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        return PENDING; // Default fallback
    }
}