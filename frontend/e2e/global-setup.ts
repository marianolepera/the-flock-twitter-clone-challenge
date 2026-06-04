const apiURL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000'

export default async function globalSetup() {
  try {
    const response = await fetch(`${apiURL}/health`)
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`)
    }
  } catch (error) {
    console.warn(
      `[e2e] Backend not reachable at ${apiURL}. Start the API (e.g. docker compose up) before running Playwright tests.`,
    )
    console.warn(error)
    process.exit(1)
  }
}
