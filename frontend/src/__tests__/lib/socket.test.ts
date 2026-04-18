import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { socket } from '../../lib/socket'

describe('Socket Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be defined', () => {
    expect(socket).toBeDefined()
  })

  it('should have emit method', () => {
    expect(socket.emit).toBeDefined()
  })

  it('should have on method', () => {
    expect(socket.on).toBeDefined()
  })

  it('should have off method', () => {
    expect(socket.off).toBeDefined()
  })

  it('should have connect method', () => {
    expect(socket.connect).toBeDefined()
  })

  it('should have disconnect method', () => {
    expect(socket.disconnect).toBeDefined()
  })
})