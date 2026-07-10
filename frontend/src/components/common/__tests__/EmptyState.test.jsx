import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EmptyState from '../EmptyState'

describe('EmptyState', () => {
  it('renders default title and description', () => {
    render(<EmptyState />)
    expect(screen.getByText(/no data found/i)).toBeInTheDocument()
    expect(screen.getByText(/no items to display/i)).toBeInTheDocument()
  })

  it('renders custom title and description', () => {
    render(<EmptyState title="Custom Title" description="Custom description" />)
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom description')).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    render(<EmptyState action={<button>Add Item</button>} />)
    expect(screen.getByText('Add Item')).toBeInTheDocument()
  })
})
