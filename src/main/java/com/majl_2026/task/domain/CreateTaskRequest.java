package com.majl_2026.task.domain;

import com.majl_2026.task.domain.enums.TaskPriority;

import java.time.LocalDate;

public record CreateTaskRequest (
        String title,
        String description,
        LocalDate dueDate,
        TaskPriority priority
) {
}
