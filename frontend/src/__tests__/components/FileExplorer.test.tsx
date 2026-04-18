import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import FileExplorer from '../../components/FileExplorer'

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { id: 'new1' } }),
    put: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
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

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn()

const mockUser = { id: 'u1', username: 'testuser', email: 'test@test.com' }
const mockWorkspace = { id: 'ws1', name: 'Test Workspace' }

describe('FileExplorer Component', () => {
  it('renders without error', () => {
    render(<FileExplorer workspaceId="ws1" user={mockUser} workspace={mockWorkspace} />)
    const container = document.querySelector('.flex.flex-col')
    expect(container).toBeInTheDocument()
  })

  it('renders with workspace prop', () => {
    const { container } = render(<FileExplorer workspaceId="ws1" user={mockUser} workspace={mockWorkspace} />)
    expect(container).toBeInTheDocument()
  })

  it('renders with user prop', () => {
    const { container } = render(<FileExplorer workspaceId="ws1" user={mockUser} workspace={mockWorkspace} />)
    expect(container).toBeInTheDocument()
  })

  it('renders with isPicker prop', () => {
    const { container } = render(<FileExplorer workspaceId="ws1" user={mockUser} workspace={mockWorkspace} isPicker={true} />)
    expect(container).toBeInTheDocument()
  })
})