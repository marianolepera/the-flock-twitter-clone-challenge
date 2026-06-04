export const timelineKeys = {
  all: ['timeline'] as const,
  feed: () => [...timelineKeys.all, 'feed'] as const,
}
