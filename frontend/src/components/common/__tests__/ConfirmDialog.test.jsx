import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ConfirmDialog from '../ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog isOpen={false} title="Confirm" message="Sure?" onClose={() => {}} onConfirm={() => {}} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders title and message when open', () => {
    render(
      <ConfirmDialog isOpen={true} title="Delete Item" message="Are you sure?" onClose={() => {}} onConfirm={() => {}} />
    )
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('renders custom confirm text', () => {
    render(
      <ConfirmDialog isOpen={true} title="Test" message="Msg" confirmText="Yes, Delete" onClose={() => {}} onConfirm={() => {}} />
    )
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument()
  })
})
