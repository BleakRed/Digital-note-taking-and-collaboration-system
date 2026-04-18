import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/react'
import Avatar from '../../components/Avatar'

describe('Avatar Component', () => {
  it('renders an image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="Test Avatar" size={40} />)
    const img = screen.getByAltText('Test Avatar')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('renders fallback icon when src is not provided', () => {
    render(<Avatar size={20} />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders fallback icon when image fails to load', () => {
    render(<Avatar src="invalid-url" size={20} alt="broken avatar" />)
    const img = screen.getByAltText('broken avatar')
    // Trigger the onerror handler
    fireEvent.error(img)
    // After error, fallback should render
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('renders fallback text when fallbackText is provided', () => {
    render(<Avatar fallbackText="John Doe" size={20} />)
    const text = screen.getByText('Jo')
    expect(text).toBeInTheDocument()
  })

  it('renders only first two characters of fallbackText', () => {
    render(<Avatar fallbackText="Alice" size={20} />)
    expect(screen.getByText('Al')).toBeInTheDocument()
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Avatar size={20} className="rounded-full bg-blue-500" />)
    expect(container.firstChild).toHaveClass('rounded-full')
    expect(container.firstChild).toHaveClass('bg-blue-500')
  })
})
