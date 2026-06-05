import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Skeleton } from '@/components/atoms/Skeleton'

describe('Skeleton', () => {
  it('renders a pulsing placeholder', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />)

    const el = container.firstChild as HTMLElement
    expect(el).toHaveClass('animate-pulse', 'h-4', 'w-20')
    expect(el).toHaveAttribute('aria-hidden', 'true')
  })
})
