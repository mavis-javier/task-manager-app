import { useState, useEffect, useCallback } from 'react'
import * as api from './lib/api'
import type { Task, TaskPriority, TaskStatus, CreateTaskRequest, UpdateTaskRequest } from './types'
import { TaskCard } from './components/TaskCard'
import { TaskForm } from './components/TaskForm'
import './App.css'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const loadTasks = useCallback(async () => {
    try {
      setError(null)
      const data = await api.listTasks()
      setTasks(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  async function handleCreate(data: CreateTaskRequest) {
    const task = await api.createTask(data)
    setTasks((prev) => [...prev, task])
    setFormOpen(false)
  }

  async function handleUpdate(id: string, data: UpdateTaskRequest) {
    const currentTask = await api.updateTask(id, data)
    setTasks((prev) => prev.map((task) => (task.id === id ? currentTask : task)))
    setEditingTask(null)
  }

  async function handleDelete(id: string) {
    await api.deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function handleToggleStatus(task: Task) {
    try {
      const newStatus = task.status === 'OPEN' ? 'COMPLETE' : 'OPEN'
      await handleUpdate(task.id, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        status: newStatus,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to update task'
      setError(msg)
    }
  }

  function openEdit(task: Task) {
    setEditingTask(task)
  }

  if (loading) {
    return (
      <div className="container">
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Tasks</h1>
        <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
          + New Task
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
          <button className="btn btn-sm" style={{ marginLeft: '0.5rem' }} onClick={loadTasks}>
            Retry
          </button>
        </div>
      )}

      {tasks.length === 0 && !error ? (
        <div className="empty-state">
          <p>No tasks yet</p>
          <button className="btn btn-primary" onClick={() => setFormOpen(true)}>
            Create your first task
          </button>
        </div>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={() => handleToggleStatus(task)}
            onEdit={() => openEdit(task)}
            onDelete={() => handleDelete(task.id)}
          />
        ))
      )}

      <TaskForm
        open={formOpen || editingTask !== null}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false)
            setEditingTask(null)
          }
        }}
        task={editingTask}
        onSubmit={({ title, description, priority, dueDate, status }) => {
          if (editingTask) {
            return handleUpdate(editingTask.id, {
              title,
              description,
              priority: priority as TaskPriority,
              dueDate,
              status: status as TaskStatus,
            })
          }
          return handleCreate({
            title,
            description,
            priority: priority as TaskPriority,
            dueDate,
          })
        }}
      />
    </div>
  )
}
