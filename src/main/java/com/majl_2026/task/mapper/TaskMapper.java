package com.majl_2026.task.mapper;

import com.majl_2026.task.domain.CreateTaskRequest;
import com.majl_2026.task.domain.UpdateTaskRequest;
import com.majl_2026.task.domain.dto.CreateTaskRequestDto;
import com.majl_2026.task.domain.dto.TaskDto;
import com.majl_2026.task.domain.dto.UpdateTaskRequestDto;
import com.majl_2026.task.domain.entity.Task;

public interface TaskMapper {
    CreateTaskRequest fromDto(CreateTaskRequestDto dto);

    UpdateTaskRequest fromDto(UpdateTaskRequestDto dto);

    TaskDto toDto(Task task);
}
