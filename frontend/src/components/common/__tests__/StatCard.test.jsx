import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Users } from 'lucide-react'
import StatCard from '../StatCard'

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Students" value="42" icon={Users} />)
    expect(screen.getByText('Total Students')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<StatCard title="Test" value="10" icon={Users} subtitle="Active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders positive trend', () => {
    render(<StatCard title="Test" value="10" icon={Users} trend={15} />)
    expect(screen.getByText(/15%/)).toBeInTheDocument()
  })

  it('renders negative trend', () => {
    render(<StatCard title="Test" value="10" icon={Users} trend={-5} />)
    expect(screen.getByText(/5%/)).toBeInTheDocument()
  })
})
