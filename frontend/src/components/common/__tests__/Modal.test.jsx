import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Modal from '../Modal'

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal isOpen={false} title="Test" onClose={() => {}}>
        Content
      </Modal>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders content when open', () => {
    render(
      <Modal isOpen={true} title="Test Modal" onClose={() => {}}>
        <p>Modal Content</p>
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })
})
