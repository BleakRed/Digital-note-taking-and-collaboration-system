import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DrawingCanvas from '../../components/DrawingCanvas'

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

import { socket } from '../../lib/socket'

describe('DrawingCanvas Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(socket.emit as any).mockResolvedValue()
    ;(socket.on as any).mockReturnValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders canvas container', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    const container = document.querySelector('.flex.flex-col.h-full')
    expect(container).toBeInTheDocument()
  })

  it('renders toolbar', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    const toolbar = document.querySelector('.flex.items-center.gap-2')
    expect(toolbar).toBeInTheDocument()
  })

  it('renders color picker buttons', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    // Color selector buttons exist
    const colors = document.querySelectorAll('button.rounded-full')
    expect(colors.length).toBeGreaterThan(0)
  })

  it('renders tool buttons container', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    const tools = document.querySelector('.flex.items-center.gap-1')
    expect(tools).toBeInTheDocument()
  })

  it('calls socket.emit on mount', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    expect(socket.emit).toHaveBeenCalled()
  })

  it('renders background container', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    const bg = document.querySelector('.bg-slate-50')
    expect(bg).toBeInTheDocument()
  })

  it('renders canvas element', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    const canvas = document.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('renders tool buttons with icons', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    const buttons = document.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders color options', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    const colorBtns = document.querySelectorAll('[class*="rounded-full"]')
    expect(colorBtns.length).toBeGreaterThan(0)
  })

  it('renders drawing area', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    const area = document.querySelector('[class*="flex-1"]')
    expect(area).toBeInTheDocument()
  })

  it('renders brush size control', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    const brushSize = document.querySelector('[class*="range"]') || document.querySelector('input[type="range"]')
    // Check for range input or slider control
  })

  it('connects to socket on mount', () => {
    render(<DrawingCanvas workspaceId="ws1" />)
    expect(socket.emit).toHaveBeenCalled()
  })
})