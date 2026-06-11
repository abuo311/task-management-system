package com.taskmanager.dto;

import java.time.LocalDateTime;

public record ActivityDTO(Long id, String message, LocalDateTime createdAt) {

}