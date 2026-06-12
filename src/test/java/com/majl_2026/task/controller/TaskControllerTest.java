package com.majl_2026.task.controller;

import com.majl_2026.task.domain.CreateTaskRequest;
import com.majl_2026.task.domain.UpdateTaskRequest;
import com.majl_2026.task.domain.dto.TaskDto;
import com.majl_2026.task.domain.dto.UpdateTaskRequestDto;
import com.majl_2026.task.domain.entity.Task;
import com.majl_2026.task.domain.enums.TaskPriority;
import com.majl_2026.task.domain.enums.TaskStatus;
import com.majl_2026.task.exception.TaskNotFoundException;
import com.majl_2026.task.mapper.TaskMapper;
import com.majl_2026.task.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    @MockitoBean
    private TaskMapper taskMapper;

    private final UUID taskId = UUID.randomUUID();
    private final LocalDate futureDate = LocalDate.now().plusDays(1);
    private final String taskTitle = "Test Task";
    private final TaskDto taskDto = new TaskDto(taskId, taskTitle, "Description",
            futureDate, TaskPriority.HIGH, TaskStatus.OPEN);
    private final Task task = new Task(taskId, taskTitle, "Description",
            futureDate, TaskStatus.OPEN, TaskPriority.HIGH, null, null);

    @Test
    void createTask_withValidBody_returns201() throws Exception {
        when(taskMapper.fromDto(any(CreateTaskRequest.class)))
                .thenReturn(new CreateTaskRequest("New Task", "A description",
                        futureDate, TaskPriority.HIGH));
        when(taskService.createTask(any())).thenReturn(task);
        when(taskMapper.toDto(any())).thenReturn(taskDto);

        mockMvc.perform(post("/api/v1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        // triple quotes allow multiple lines of JSON without the need of \n
                        .content(String.format(""" 
                                {
                                    "title": "New Task",
                                    "description": "A description",
                                    "dueDate": "%s",
                                    "priority": "HIGH"
                                }
                                """, futureDate)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value(taskTitle));
    }

    @Test
    void listTasks_returns200() throws Exception {
        when(taskService.listTasks()).thenReturn(List.of(task));
        when(taskMapper.toDto(any())).thenReturn(taskDto);

        mockMvc.perform(get("/api/v1/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value(taskTitle));
    }

    @Test
    void listTasks_whenEmpty_returns200() throws Exception {
        when(taskService.listTasks()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void updateTask_withValidBody_returns200() throws Exception {
        var updatedTask = new Task(taskId, "Updated Task", "Updated",
                futureDate, TaskStatus.COMPLETE, TaskPriority.MEDIUM, null, null);
        var updatedTaskDto = new TaskDto(taskId, "Updated Task", "Updated",
                futureDate, TaskPriority.MEDIUM, TaskStatus.COMPLETE);

        when(taskMapper.fromDto(any(UpdateTaskRequestDto.class)))
                .thenReturn(new UpdateTaskRequest("Updated Task", "Updated",
                        futureDate, TaskStatus.COMPLETE, TaskPriority.MEDIUM));
        when(taskService.updateTask(any(), any())).thenReturn(updatedTask);
        when(taskMapper.toDto(any())).thenReturn(updatedTaskDto);

        mockMvc.perform(put("/api/v1/tasks/{taskId}", taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {
                                    "title": "Updated Task",
                                    "description": "Updated",
                                    "dueDate": "%s",
                                    "priority": "MEDIUM",
                                    "status": "COMPLETE"
                                }
                                """, futureDate)))
                .andExpect(status().isOk())
                // $ refers to root of JSON document
                .andExpect(jsonPath("$.title").value("Updated Task"));
    }

    @Test
    void updateTask_withNonExistentId_returns400() throws Exception {
        var nonExistentId = UUID.randomUUID();
        when(taskMapper.fromDto(any(UpdateTaskRequestDto.class)))
                .thenReturn(new UpdateTaskRequest("Updated Task", "Updated",
                        futureDate, TaskStatus.COMPLETE, TaskPriority.MEDIUM));
        when(taskService.updateTask(any(), any()))
                .thenThrow(new TaskNotFoundException(nonExistentId));

        mockMvc.perform(put("/api/v1/tasks/{taskId}", nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(String.format("""
                                {
                                    "title": "Updated Task",
                                    "description": "Updated",
                                    "dueDate": "%s",
                                    "priority": "MEDIUM",
                                    "status": "COMPLETE"
                                }
                                """, futureDate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(
                        "Task with ID '" + nonExistentId + "' does not exist"));
    }

    @Test
    void updateTask_withBlankTitle_returns400() throws Exception {
        mockMvc.perform(put("/api/v1/tasks/{taskId}", taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "",
                                    "priority": "MEDIUM",
                                    "status": "OPEN"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error")
                        .value("Title must be between 1 and 255 characters."));
    }

    @Test
    void updateTask_withNullStatus_returns400() throws Exception {
        mockMvc.perform(put("/api/v1/tasks/{taskId}", taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "title": "Valid Title",
                                    "priority": "MEDIUM",
                                    "status": null
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Status must be provided."));
    }

    @Test
    void updateTask_withInvalidJson_returns400() throws Exception {
        mockMvc.perform(put("/api/v1/tasks/{taskId}", taskId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid json}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteTask_withExistingId_returns204() throws Exception {
        mockMvc.perform(delete("/api/v1/tasks/{taskId}", taskId))
                .andExpect(status().isNoContent());

        verify(taskService).deleteTask(taskId);
    }

    @Test
    void deleteTask_whenServiceThrows_propagatesException() {
        doThrow(new RuntimeException("DB error")).when(taskService).deleteTask(any());

        assertThrows(Exception.class, () ->
                mockMvc.perform(delete("/api/v1/tasks/{taskId}", taskId)));
    }
}
