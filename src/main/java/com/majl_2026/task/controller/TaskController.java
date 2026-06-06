package com.majl_2026.task.controller;

import com.majl_2026.task.domain.CreateTaskRequest;
import com.majl_2026.task.domain.dto.TaskDto;
import com.majl_2026.task.domain.entity.Task;
import com.majl_2026.task.mapper.TaskMapper;
import com.majl_2026.task.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController// receives REST API endpoints
@RequestMapping(path = "/api/v1/tasks")
public class TaskController {
    private final TaskService taskService;
    private final TaskMapper taskMapper;

    public TaskController(TaskService taskService, TaskMapper taskMapper) {
        this.taskService = taskService;
        this.taskMapper = taskMapper;
    }

    @PostMapping // HTTP post method to use
    public ResponseEntity<TaskDto> createTask(
            @Valid @RequestBody CreateTaskRequest createTaskRequestDto
    ) {
        CreateTaskRequest createTaskRequest = taskMapper.fromDto(createTaskRequestDto);
        Task task = taskService.createTask(createTaskRequest);
        TaskDto createdTaskDto = taskMapper.toDto(task);
        return new ResponseEntity<>(createdTaskDto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> listTasks() {
        List<Task> tasks = taskService.listTasks();
        List<TaskDto> taskDtoList = tasks.stream()
                .map(taskMapper::toDto)
                .toList();

        return ResponseEntity.ok(taskDtoList);
    }
}
