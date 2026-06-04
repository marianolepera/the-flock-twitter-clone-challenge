import { ComposeTweet } from '@/features/tweets/components/ComposeTweet'
import { TimelineFeed } from '@/features/timeline/components/TimelineFeed'

export function HomePage() {
  return (
    <>
      <header className="sticky top-[57px] z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:top-0">
        <h1 className="text-xl font-bold">Home</h1>
      </header>

      <ComposeTweet />
      <TimelineFeed />
    </>
  )
}
