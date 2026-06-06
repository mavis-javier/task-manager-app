package com.majl_2026.task.service;

import com.majl_2026.task.domain.CreateTaskRequest;
import com.majl_2026.task.domain.entity.Task;

import java.util.List;

public interface TaskService {
    Task createTask(CreateTaskRequest request);

    List<Task> listTasks();
}
