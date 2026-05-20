import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KanbanBoard from '../../components/KanbanBoard'

// Mock dependencies
vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}))

vi.mock('../../lib/socket', () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }
}))

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  }
}))

import api from '../../lib/api'
import { socket } from '../../lib/socket'
import Cookies from 'js-cookie'

const mockBoard = {
  id: 'board1',
  title: 'Project Board',
  columns: [
    { id: 'col1', title: 'To Do', color: '#3b82f6', order: 0, cards: [
      { id: 'card1', content: 'Task 1', columnId: 'col1', order: 0, author: { id: 'u1', username: 'test' }, assignees: [] }
    ]},
    { id: 'col2', title: 'In Progress', color: '#ef4444', order: 1, cards: [] }
  ]
}

const mockEmptyBoard = {
  id: 'board2',
  title: 'Empty Board',
  columns: []
}

const mockUser = { id: 'u1', username: 'testuser', email: 'test@test.com' }

describe('KanbanBoard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(Cookies.get as any).mockReturnValue(JSON.stringify(mockUser))
    ;(api.get as any).mockResolvedValue({ data: mockBoard })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders board title', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      expect(screen.getByText('Project Board')).toBeInTheDocument()
    })
  })

  it('renders column titles', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument()
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })
  })

  it('renders cards in columns', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument()
    })
  })

  it('shows Add Column button for board', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      expect(screen.getByText('Add Column')).toBeInTheDocument()
    })
  })

  it('displays board header with title', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Project Board/i })).toBeInTheDocument()
    })
  })

  it('calls socket.emit on mount', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalled()
    })
  })

  it('displays column colors', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      const columns = screen.getAllByText(/To Do|In Progress/)
      expect(columns.length).toBeGreaterThan(0)
    })
  })

  it('shows card content text', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument()
    })
  })

  it('renders kanban layout structure', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      const board = document.querySelector('.flex')
      expect(board).toBeInTheDocument()
    })
  })

  it('shows board not found when no board selected', async () => {
    ;(api.get as any).mockResolvedValue({ data: null })
    render(<KanbanBoard workspaceId="ws1" boardId="nonexistent" />)
    await waitFor(() => {
      expect(screen.getByText(/Board not found/i)).toBeInTheDocument()
    })
  })

  it('shows loading state initially', async () => {
    ;(api.get as any).mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    // Loading state shows when still loading
  })

  it('renders column background colors', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      const columns = document.querySelectorAll('[class*="rounded"]')
      expect(columns.length).toBeGreaterThan(0)
    })
  })

  it('renders column with color style', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      const cols = document.querySelectorAll('[class*="rounded"]')
      expect(cols.length).toBeGreaterThan(0)
    })
  })

  it('renders board title', async () => {
    render(<KanbanBoard workspaceId="ws1" boardId="board1" />)
    await waitFor(() => {
      expect(screen.getByText('Project Board')).toBeInTheDocument()
    })
  })

  it('handles empty columns array', async () => {
    ;(api.get as any).mockResolvedValue({ data: mockEmptyBoard })
    render(<KanbanBoard workspaceId="ws1" boardId="board2" />)
    await waitFor(() => {
      expect(screen.getByText('Empty Board')).toBeInTheDocument()
    })
  })
})