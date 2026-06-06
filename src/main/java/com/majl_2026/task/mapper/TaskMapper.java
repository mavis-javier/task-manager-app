package com.majl_2026.task.mapper;

import com.majl_2026.task.domain.CreateTaskRequest;
import com.majl_2026.task.domain.dto.TaskDto;
import com.majl_2026.task.domain.entity.Task;

public interface TaskMapper {
    CreateTaskRequest fromDto(CreateTaskRequest dto);

    TaskDto toDto(Task task);
}
