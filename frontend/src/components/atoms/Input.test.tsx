import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Input } from '@/components/atoms/Input'

describe('Input', () => {
  it('renders with label and associates it to the control', () => {
    render(<Input label="Email" name="email" />)

    const input = screen.getByLabelText(/email/i)
    expect(input).toHaveAttribute('name', 'email')
  })

  it('shows error text when provided', () => {
    render(<Input label="Email" error="Email is required" />)

    expect(screen.getByRole('alert')).toHaveTextContent(/email is required/i)
  })

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<Input label="Search" onChange={onChange} />)

    await user.type(screen.getByLabelText(/search/i), 'bob')

    expect(onChange).toHaveBeenCalled()
  })
})
