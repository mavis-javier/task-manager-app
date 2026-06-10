import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types'

const BASE_URL = '/api/v1/tasks'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.json()
      message = body.message || body.error || JSON.stringify(body)
    } catch {}
    throw new Error(message)
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

export async function listTasks(): Promise<Task[]> {
  const response = await fetch(BASE_URL)
  return handleResponse<Task[]>(response)
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<Task>(response)
}

export async function updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<Task>(response)
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  })
  return handleResponse<void>(response)
}
