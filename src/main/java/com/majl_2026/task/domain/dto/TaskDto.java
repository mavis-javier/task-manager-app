package com.majl_2026.task.domain.dto;

import com.majl_2026.task.domain.enums.TaskPriority;
import com.majl_2026.task.domain.enums.TaskStatus;

import java.time.LocalDate;
import java.util.UUID;

// no annotations here - always used for RESPONSE body, not request body
public record TaskDto(
        UUID id,
        String title,
        String description,
        LocalDate dueDate,
        TaskPriority priority,
        TaskStatus status
) {

}
