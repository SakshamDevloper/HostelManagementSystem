import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with loading text', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders without fullScreen mode', () => {
    const { container } = render(<LoadingSpinner fullScreen={false} />)
    expect(container.querySelector('.min-h-screen')).toBeNull()
  })
})
