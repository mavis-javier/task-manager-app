import { describe, it, expect, beforeEach, vi } from 'vitest'
import { listTasks, createTask, updateTask, deleteTask } from './api'
import type { Task } from '../types'

const BASE_URL = '/api/v1/tasks'

const mockTask: Task = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Test Task',
  description: 'A test task',
  dueDate: '2027-06-01',
  priority: 'HIGH',
  status: 'OPEN',
}

// runs before each test case
beforeEach(() => {
  // restore to clean state before each test case is run
  vi.restoreAllMocks()
})

describe('listTasks', () => {
  it('returns tasks on successful fetch', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([mockTask]),
    } as Response)

    const result = await listTasks()

    expect(result).toEqual([mockTask])
    expect(fetch).toHaveBeenCalledWith(BASE_URL)
  })

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    } as Response)

    await expect(listTasks()).rejects.toThrow('Server error')
  })

  it('throws with HTTP status when body cannot be parsed', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('Invalid JSON')),
    } as Response)

    await expect(listTasks()).rejects.toThrow('HTTP 500')
  })
})

describe('createTask', () => {
  it('returns created task on 201', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockTask),
    } as Response)

    const result = await createTask({
      title: 'Test Task',
      description: 'A test task',
      // TODO: change date format when updated in backend
      dueDate: '2027-06-01',
      priority: 'HIGH',
    })

    expect(result).toEqual(mockTask)
    expect(fetch).toHaveBeenCalledWith(BASE_URL, expect.objectContaining({ method: 'POST' }))
  })

  it('throws on validation error from API', async () => {
    // global this may refer to browser's window or anywhere in Node.js to intercept fetch(apiLink)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Title must be between 1 and 255 characters.' }),
    } as Response)

    await expect(
      createTask({ title: '', priority: 'HIGH' })
    ).rejects.toThrow('Title must be between 1 and 255 characters.')
  })

  it('sends correct request body', async () => {
    let requestBody: string | undefined
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      requestBody = init?.body as string
      return {
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockTask),
      } as Response
    })

    const body = {
      title: 'New Task',
      description: null,
      dueDate: null,
      priority: 'MEDIUM' as const,
    }
    await createTask(body)

    expect(JSON.parse(requestBody!)).toEqual(body)
  })
})

describe('updateTask', () => {
  const taskId = mockTask.id

  it('returns updated task on success', async () => {
    const updated = { ...mockTask, title: 'Updated', status: 'COMPLETE' as const }
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(updated),
    } as Response)

    const result = await updateTask(taskId, {
      title: 'Updated',
      priority: 'HIGH',
      status: 'COMPLETE',
    })

    expect(result).toEqual(updated)
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/${taskId}`,
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('throws when task not found', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: `Task with ID '${taskId}' does not exist` }),
    } as Response)

    await expect(
      updateTask(taskId, { title: 'Nope', priority: 'LOW', status: 'OPEN' })
    ).rejects.toThrow('does not exist')
  })
})

describe('deleteTask', () => {
  it('returns undefined on 204', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 204,
    } as Response)

    const result = await deleteTask(mockTask.id)

    expect(result).toBeUndefined()
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/${mockTask.id}`,
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})
