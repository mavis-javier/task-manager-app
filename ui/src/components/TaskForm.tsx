import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'
import type { Task, TaskPriority, TaskStatus } from '../types'

interface TaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onSubmit: (data: { title: string; description: string | null; priority: string; dueDate: string | null; status?: string }) => Promise<void>
}

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
]

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'COMPLETE', label: 'Complete' },
]

export function TaskForm({ open, onOpenChange, task, onSubmit }: TaskFormProps) {
  const isEditing = task !== null
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [status, setStatus] = useState<TaskStatus>('OPEN')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setPriority(task.priority)
      setStatus(task.status)
      setDueDate(task.dueDate ?? '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
      setStatus('OPEN')
      setDueDate('')
    }
    setError(null)
  }, [task, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description || null,
        priority,
        dueDate: dueDate || null,
        ...(isEditing ? { status } : {}),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">
            {isEditing ? 'Edit Task' : 'New Task'}
          </Dialog.Title>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label" htmlFor="title">
                Title *
              </label>
              <input
                id="title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                maxLength={255}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description (optional)"
                maxLength={1000}
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Priority *</label>
                <Select.Root value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                  <Select.Trigger className="select-trigger">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="select-content">
                      <Select.Viewport>
                        {priorities.map((p) => (
                          <Select.Item key={p.value} className="select-item" value={p.value}>
                            <Select.ItemText>{p.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              {isEditing && (
                <div className="form-field">
                  <label className="form-label">Status *</label>
                  <Select.Root value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                    <Select.Trigger className="select-trigger">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="select-content">
                        <Select.Viewport>
                          {statuses.map((s) => (
                            <Select.Item key={s.value} className="select-item" value={s.value}>
                              <Select.ItemText>{s.label}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              )}

              <div className="form-field">
                <label className="form-label" htmlFor="dueDate">
                  Due Date
                </label>
                <input
                  id="dueDate"
                  className="form-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="btn"
                style={{ background: '#f1f5f9', color: 'var(--color-text)' }}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
