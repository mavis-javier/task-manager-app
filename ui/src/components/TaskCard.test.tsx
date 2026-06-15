import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from './TaskCard'
import type { Task } from '../types'

// TODO: change to new Date(Date.now() + (24 * 60 * 60 * 1000)).toLocaleDateString() after changing format passed by Spring from YYYY-MM-DD to MM/DD/YYYY
const futureDate = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const mockTask: Task = {
  id: '1',
  title: 'Buy groceries',
  description: 'Milk, eggs, bread',
  dueDate: futureDate,
  priority: 'HIGH',
  status: 'OPEN',
}

const completedTask: Task = {
  ...mockTask,
  id: '2',
  title: 'Done task',
  status: 'COMPLETE',
  priority: 'LOW',
}

describe('TaskCard', () => {
  it('renders task title and description', () => {
    render(<TaskCard task={mockTask} onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} />)

    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Milk, eggs, bread')).toBeInTheDocument()
  })

  it('renders priority and status badges', () => {
    render(<TaskCard task={mockTask} onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} />)

    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders due date when present', () => {
    render(<TaskCard task={mockTask} onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} />)

    expect(screen.getByText(new RegExp(`Due: ${futureDate}`))).toBeInTheDocument()
  })

  it('does not render due date when null', () => {
    const taskNoDue = { ...mockTask, dueDate: null }
    render(<TaskCard task={taskNoDue} onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} />)

    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument()
  })

  it('does not render description when null', () => {
    const taskNoDesc = { ...mockTask, description: null }
    render(<TaskCard task={taskNoDesc} onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} />)

    expect(screen.queryByText('Milk, eggs, bread')).not.toBeInTheDocument()
  })

  it('applies completed class when status is COMPLETE', () => {
    const { container } = render(
      <TaskCard task={completedTask} onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} />
    )

    const card = container.querySelector('.task-card')
    expect(card).toHaveClass('completed')
  })

  it('does not apply completed class when status is OPEN', () => {
    const { container } = render(
      <TaskCard task={mockTask} onToggle={() => {}} onEdit={() => {}} onDelete={() => {}} />
    )

    const card = container.querySelector('.task-card')
    expect(card).not.toHaveClass('completed')
  })

  it('calls onToggle when checkbox is clicked', async () => {
    const onToggle = vi.fn()
    render(<TaskCard task={mockTask} onToggle={onToggle} onEdit={() => {}} onDelete={() => {}} />)

    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    render(<TaskCard task={mockTask} onToggle={() => {}} onEdit={onEdit} onDelete={() => {}} />)

    const editButton = screen.getByTitle('Edit')
    await userEvent.click(editButton)

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(<TaskCard task={mockTask} onToggle={() => {}} onEdit={() => {}} onDelete={onDelete} />)

    const deleteButton = screen.getByTitle('Delete')
    await userEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
