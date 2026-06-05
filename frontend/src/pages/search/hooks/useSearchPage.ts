import { useState } from 'react'

import { useDebouncedValue } from '@/hooks/useDebouncedValue/useDebouncedValue'

export function useSearchPage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)

  return { query, setQuery, debouncedQuery }
}
