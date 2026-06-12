package com.majl_2026.task.service;

import com.majl_2026.task.domain.CreateTaskRequest;
import com.majl_2026.task.domain.UpdateTaskRequest;
import com.majl_2026.task.domain.entity.Task;
import com.majl_2026.task.domain.enums.TaskPriority;
import com.majl_2026.task.domain.enums.TaskStatus;
import com.majl_2026.task.exception.TaskNotFoundException;
import com.majl_2026.task.repository.TaskRepository;
import com.majl_2026.task.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    @Captor
    private ArgumentCaptor<Task> taskCaptor;

    private final UUID taskId = UUID.randomUUID();
    private final LocalDate dueDate = LocalDate.now().plusDays(1);

    @Test
    void createTask_withValidRequest_persistsSuccessfully() {
        String taskTitle = "Test Task";
        var request = new CreateTaskRequest(taskTitle, "Description", dueDate, TaskPriority.HIGH);
        var savedTask = new Task(taskId, taskTitle, "Description", dueDate,
                TaskStatus.OPEN, TaskPriority.HIGH, Instant.now(), Instant.now());

        // when save() is called return the same object savedTask
        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        Task result = taskService.createTask(request);

        assertThat(result.getId()).isEqualTo(taskId);
        assertThat(result.getTitle()).isEqualTo(taskTitle);
        assertThat(result.getStatus()).isEqualTo(TaskStatus.OPEN);
        assertThat(result.getPriority()).isEqualTo(TaskPriority.HIGH);

        verify(taskRepository).save(taskCaptor.capture());
        Task captured = taskCaptor.getValue();
        assertThat(captured.getId()).isNull();
        assertThat(captured.getTitle()).isEqualTo(taskTitle);
        assertThat(captured.getStatus()).isEqualTo(TaskStatus.OPEN);
        assertThat(captured.getCreated()).isNotNull();
        assertThat(captured.getUpdated()).isNotNull();
    }

    @Test
    void createTask_withFullDetails_persistsDescriptionAndDueDate() {
        var request = new CreateTaskRequest("Full Task", "Full Description", dueDate, TaskPriority.HIGH);
        // when save() is called, return the task passed from save()
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task result = taskService.createTask(request);

        assertThat(result.getDescription()).isEqualTo("Full Description");
        assertThat(result.getDueDate()).isEqualTo(dueDate);
    }

    @Test
    void createTask_whenDbFails_throwsException() {
        var request = new CreateTaskRequest("Fail Task", null, null, TaskPriority.LOW);

        when(taskRepository.save(any(Task.class)))
                .thenThrow(new DataAccessException("DB connection failed") {});

        assertThatThrownBy(() -> taskService.createTask(request))
                .isInstanceOf(DataAccessException.class)
                .hasMessageContaining("DB connection failed");
    }

    @Test
    void listTasks_returnsAllTasksSortedByCreatedAsc() {
        var task1 = new Task(UUID.randomUUID(), "Task 1", null, null,
                TaskStatus.OPEN, TaskPriority.LOW, Instant.now(), Instant.now());
        var task2 = new Task(UUID.randomUUID(), "Task 2", null, null,
                TaskStatus.OPEN, TaskPriority.HIGH, Instant.now(), Instant.now());

        when(taskRepository.findAll(Sort.by(Sort.Direction.ASC, "created")))
                .thenReturn(List.of(task1, task2));

        List<Task> result = taskService.listTasks();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Task 1");
        assertThat(result.get(1).getTitle()).isEqualTo("Task 2");
    }

    @Test
    void listTasks_whenEmpty_returnsEmptyList() {
        when(taskRepository.findAll(Sort.by(Sort.Direction.ASC, "created")))
                .thenReturn(List.of());

        List<Task> result = taskService.listTasks();

        assertThat(result).isEmpty();
    }

    @Test
    void updateTask_withValidRequest_updatesSuccessfully() {
        var existingTask = new Task(taskId, "Original Title", "Original Desc", dueDate,
                TaskStatus.OPEN, TaskPriority.MEDIUM, Instant.now(), Instant.now());
        var updateRequest = new UpdateTaskRequest("Updated Title", "Updated Desc",
                dueDate, TaskStatus.COMPLETE, TaskPriority.HIGH);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(existingTask)).thenReturn(existingTask);

        Task result = taskService.updateTask(taskId, updateRequest);

        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getDescription()).isEqualTo("Updated Desc");
        assertThat(result.getStatus()).isEqualTo(TaskStatus.COMPLETE);
        assertThat(result.getPriority()).isEqualTo(TaskPriority.HIGH);
        assertThat(result.getUpdated()).isNotNull();
    }

    @Test
    void updateTask_withNonExistentId_throwsTaskNotFoundException() {
        var nonExistentId = UUID.randomUUID();
        var updateRequest = new UpdateTaskRequest("Title", null, null, TaskStatus.OPEN, TaskPriority.LOW);

        when(taskRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.updateTask(nonExistentId, updateRequest))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining(nonExistentId.toString());
    }

    @Test
    void updateTask_whenDbPersistFails_throwsException() {
        var existingTask = new Task(taskId, "Original", null, null,
                TaskStatus.OPEN, TaskPriority.LOW, Instant.now(), Instant.now());
        var updateRequest = new UpdateTaskRequest("Updated", null, null, TaskStatus.COMPLETE, TaskPriority.HIGH);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(any(Task.class)))
                .thenThrow(new DataAccessException("Failed to update task in DB") {});

        assertThatThrownBy(() -> taskService.updateTask(taskId, updateRequest))
                .isInstanceOf(DataAccessException.class)
                .hasMessageContaining("Failed to update task in DB");
    }

    @Test
    void deleteTask_delegatesToRepository() {
        taskService.deleteTask(taskId);

        verify(taskRepository).deleteById(taskId);
    }

    @Test
    void deleteTask_whenDbFails_throwsException() {
        doThrow(new DataAccessException("DB connection failed") {})
                .when(taskRepository).deleteById(taskId);

        assertThatThrownBy(() -> taskService.deleteTask(taskId))
                .isInstanceOf(DataAccessException.class)
                .hasMessageContaining("DB connection failed");
    }
}
