package com.majl_2026.task.domain;

import com.majl_2026.task.domain.enums.TaskPriority;
import com.majl_2026.task.domain.enums.TaskStatus;

import java.time.LocalDate;

public record UpdateTaskRequest(
        String title,
        String description,
        LocalDate dueDate,
        TaskStatus status,
        TaskPriority priority
) {

}
