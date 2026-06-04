import '@/features/users/tests/mock-users-api'

import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { searchUsers } from '@/api/users/users-api'
import {
  UserSearchForm,
  UserSearchResults,
} from '@/features/users/components/UserSearch'
import { renderWithProviders } from '@/test/test-utils'

describe('UserSearchResults', () => {
  it('prompts for at least 3 characters when the query is too short', () => {
    renderWithProviders(<UserSearchResults query="bo" />)

    expect(
      screen.getByText(/type at least 3 characters to search/i),
    ).toBeInTheDocument()
    expect(searchUsers).not.toHaveBeenCalled()
  })

  it('shows an empty hint when the query is blank', () => {
    renderWithProviders(<UserSearchResults query="   " />)

    expect(
      screen.getByText(/search for people by username or email/i),
    ).toBeInTheDocument()
  })

  it('renders users returned by the API', async () => {
    renderWithProviders(<UserSearchResults query="bob" />)

    expect(await screen.findByText(/@bob/i)).toBeInTheDocument()
    expect(searchUsers).toHaveBeenCalledWith({ q: 'bob', limit: 20 })
  })

  it('shows empty state when no users match', async () => {
    vi.mocked(searchUsers).mockResolvedValueOnce([])

    renderWithProviders(<UserSearchResults query="zzz" />)

    expect(
      await screen.findByText(/no users found for "zzz"/i),
    ).toBeInTheDocument()
  })
})

describe('UserSearchForm', () => {
  it('calls onChange when typing in the search field', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [value, setValue] = useState('')
      return <UserSearchForm value={value} onChange={setValue} />
    }

    render(<Harness />)

    await user.type(screen.getByLabelText(/search users/i), 'alice')

    expect(screen.getByLabelText(/search users/i)).toHaveValue('alice')
  })
})
