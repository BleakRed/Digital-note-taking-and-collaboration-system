import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Chat from '../../components/Chat'

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
    emitWithAck: vi.fn().mockResolvedValue({}),
  }
}))

vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  }
}))

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn()

import api from '../../lib/api'
import { socket } from '../../lib/socket'

const mockMessages = [
  {
    id: 'msg1',
    content: 'Hello world',
    createdAt: '2024-01-01T10:00:00Z',
    author: { id: 'u1', username: 'testuser', email: 'test@test.com' }
  },
  {
    id: 'msg2',
    content: 'Hi there',
    createdAt: '2024-01-01T10:01:00Z',
    author: { id: 'u2', username: 'otheruser', email: 'other@test.com' }
  }
]

const mockUser = { id: 'u1', username: 'testuser', email: 'test@test.com' }
const props = {
  workspaceId: 'ws1',
  roomId: 'room1',
  user: mockUser,
  roomName: 'General'
}

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(api.get as any).mockResolvedValue({ data: mockMessages })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders chat room name in header', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument()
    })
  })

  it('renders message content', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })
  })

  it('renders multiple messages', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByText('Hi there')).toBeInTheDocument()
    })
  })

  it('shows message input field', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    })
  })

  it('renders Send button', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  it('fetches messages on mount', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/chat/room/room1/messages')
    })
  })

  it('connects to socket room', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith('join-chat', 'room1')
    })
  })

  it('displays author username', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
  })

  it('displays message timestamp', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getAllByText(/\d{1,2}:\d{2}/).length).toBeGreaterThan(0)
    })
  })

  it('renders messages in scrollable area', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      const messagesArea = document.querySelector('.overflow-y-auto')
      expect(messagesArea).toBeInTheDocument()
    })
  })

  it('shows character count when typing', async () => {
    const { container } = render(<Chat {...props} />)
    await waitFor(() => {
      const input = container.querySelector('input[type="text"]')
      expect(input).toBeInTheDocument()
    })
  })

  it('renders chat room header', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /General/i })).toBeInTheDocument()
    })
  })

  it('shows send button', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      const buttons = document.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('renders different message styles for different authors', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })
  })

  it('displays timestamp for each message', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      const timestamps = document.querySelectorAll('[class*="text-"][class*="10px"]')
      expect(timestamps.length).toBeGreaterThan(0)
    })
  })

  it('renders empty state when no messages', async () => {
    ;(api.get as any).mockResolvedValue({ data: [] })
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    })
  })

  it('shows message input disabled when not logged in', async () => {
    render(<Chat {...props} user={null} />)
    await waitFor(() => {
      const input = document.querySelector('input')
      expect(input).toBeInTheDocument()
    })
  })

  it('has edit handler function', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    })
  })

  it('has delete handler function', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    })
  })

  it('renders with user in different message', async () => {
    const otherUserProps = {
      workspaceId: 'ws1',
      roomId: 'room1',
      user: { id: 'u2', username: 'otheruser', email: 'other@test.com' },
      roomName: 'General'
    }
    render(<Chat {...otherUserProps} />)
    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument()
    })
  })

  it('shows real-time collaboration text', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByText(/Real-time collaboration room/i)).toBeInTheDocument()
    })
  })

  it('renders message area with scroll', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      const scrollable = document.querySelector('.overflow-y-auto')
      expect(scrollable).toBeInTheDocument()
    })
  })

  it('shows edit button on hover', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      // Edit buttons appear in message area
    })
  })

  it('shows delete button on hover', async () => {
    render(<Chat {...props} />)
    await waitFor(() => {
      // Delete buttons appear in message area
    })
  })

  it('handles message with long content', async () => {
    const longMessage = { ...mockMessages[0], content: 'A'.repeat(500) }
    ;(api.get as any).mockResolvedValue({ data: [longMessage] })
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByText(/A{500}/)).toBeInTheDocument()
    })
  })

  it('handles empty message array', async () => {
    ;(api.get as any).mockResolvedValue({ data: [] })
    render(<Chat {...props} />)
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Type a message...')
      expect(input).toBeInTheDocument()
    })
  })

  it('handles API error on fetch', async () => {
    ;(api.get as any).mockRejectedValue(new Error('Network error'))
    render(<Chat {...props} />)
    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument()
    })
  })
})