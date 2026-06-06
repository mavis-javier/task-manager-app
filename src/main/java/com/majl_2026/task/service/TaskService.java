package com.majl_2026.task.service;

import com.majl_2026.task.domain.CreateTaskRequest;
import com.majl_2026.task.domain.UpdateTaskRequest;
import com.majl_2026.task.domain.entity.Task;

import java.util.List;
import java.util.UUID;

public interface TaskService {
    Task createTask(CreateTaskRequest request);

    List<Task> listTasks();

    Task updateTask(UUID id, UpdateTaskRequest request);
}
