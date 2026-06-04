package com.taskmanager.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskAssignmentDto {
    private Long taskId;
    private Long laborerId;
}