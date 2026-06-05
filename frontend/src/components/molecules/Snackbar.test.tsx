import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { Snackbar } from '@/components/molecules/Snackbar'
import { useSnackbarStore } from '@/stores/snackbar.store'

describe('Snackbar', () => {
  beforeEach(() => {
    useSnackbarStore.getState().hide()
  })

  it('renders nothing when there is no message', () => {
    const { container } = render(<Snackbar />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows message and dismisses on close', async () => {
    const user = userEvent.setup()
    useSnackbarStore.getState().show('Tweet deleted')

    render(<Snackbar />)

    expect(screen.getByRole('status')).toHaveTextContent('Tweet deleted')

    await user.click(screen.getByRole('button', { name: /dismiss notification/i }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders error variant with alert role', () => {
    useSnackbarStore
      .getState()
      .show('Image must be 5 MB or smaller', 'error')

    render(<Snackbar />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Image must be 5 MB or smaller')
    expect(alert).toHaveClass('border-danger')
  })
})
