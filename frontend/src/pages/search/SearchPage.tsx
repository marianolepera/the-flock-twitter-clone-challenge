import {
  UserSearchForm,
  UserSearchResults,
} from '@/features/users/components/UserSearch'

import { useSearchPage } from './hooks/useSearchPage'

export function SearchPage() {
  const { query, setQuery, debouncedQuery } = useSearchPage()

  return (
    <>
      <header className="sticky top-[57px] z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:top-0">
        <h1 className="text-xl font-bold">Search</h1>
      </header>

      <UserSearchForm value={query} onChange={setQuery} />
      <UserSearchResults query={debouncedQuery} />
    </>
  )
}
