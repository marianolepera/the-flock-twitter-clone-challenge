import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Avatar } from '@/components/atoms/Avatar'

describe('Avatar', () => {
  it('renders an image when src is provided', () => {
    render(
      <Avatar src="https://example.com/avatar.png" alt="alice" />,
    )

    const image = screen.getByRole('img', { name: /alice/i })
    expect(image).toHaveAttribute('src', 'https://example.com/avatar.png')
  })

  it('renders initials when src is missing', () => {
    render(<Avatar alt="alice" />)

    expect(screen.getByRole('img', { name: /alice/i })).toHaveTextContent('A')
  })
})
