const UNITS = [
  { ms: 86_400_000, suffix: 'd' },
  { ms: 3_600_000, suffix: 'h' },
  { ms: 60_000, suffix: 'm' },
  { ms: 1_000, suffix: 's' },
] as const

export function formatRelativeTime(value: string | Date) {
  const then = new Date(value).getTime()
  const diff = Date.now() - then

  if (Number.isNaN(then) || diff < 0) return 'now'

  for (const { ms, suffix } of UNITS) {
    const amount = Math.floor(diff / ms)
    if (amount >= 1) return `${amount}${suffix}`
  }

  return 'now'
}
