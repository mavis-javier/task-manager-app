import * as Checkbox from '@radix-ui/react-checkbox'
import type { Task } from '../types'

interface TaskCardProps {
  task: Task
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

const priorityLabel: Record<string, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

const statusLabel: Record<string, string> = {
  OPEN: 'Open',
  COMPLETE: 'Complete',
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className={`task-card${task.status === 'COMPLETE' ? ' completed' : ''}`}>
      <Checkbox.Root
        className="checkbox-root"
        checked={task.status === 'COMPLETE'}
        onCheckedChange={onToggle}
      >
        <Checkbox.Indicator className="checkbox-indicator">
          <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Checkbox.Indicator>
      </Checkbox.Root>

      <div className="task-card-body">
        <div className="task-card-title">{task.title}</div>
        {task.description && <div className="task-card-description">{task.description}</div>}
        <div className="task-card-meta">
          <span className={`badge badge-${task.priority.toLowerCase()}`}>
            {priorityLabel[task.priority]}
          </span>
          <span className={`badge badge-${task.status.toLowerCase()}`}>
            {statusLabel[task.status]}
          </span>
          {task.dueDate && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Due: {task.dueDate}
            </span>
          )}
        </div>
      </div>

      <div className="task-card-actions">
        <button className="btn btn-ghost btn-sm" onClick={onEdit} title="Edit">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62468 8.66823 3.55363 8.77932 3.50908 8.90216L2.04508 12.9022C1.99915 13.0285 2.02667 13.1686 2.11815 13.2601C2.20963 13.3516 2.34976 13.3791 2.47604 13.3332L6.47604 11.8692C6.59888 11.8246 6.70997 11.7536 6.79984 11.6637L14.2318 4.23178C14.427 4.03652 14.427 3.71993 14.2318 3.52467L11.8536 1.14645Z" fill="currentColor" />
          </svg>
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onDelete} title="Delete">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  )
}
