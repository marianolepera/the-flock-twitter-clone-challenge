import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '@/components/atoms/Button'

describe('Button', () => {
  it('renders children and supports variants', () => {
    const { rerender } = render(<Button variant="primary">Post</Button>)

    expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument()

    rerender(<Button variant="outline">Cancel</Button>)
    expect(screen.getByRole('button', { name: /cancel/i })).toHaveClass(
      'border-border-strong',
    )
  })

  it('can render full width', () => {
    render(<Button fullWidth>Wide</Button>)

    expect(screen.getByRole('button', { name: /wide/i })).toHaveClass('w-full')
  })

  it('respects disabled state', () => {
    render(<Button disabled>Disabled</Button>)

    expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled()
  })
})
