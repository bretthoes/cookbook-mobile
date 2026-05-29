export const FetchState = {
  idle: "idle",
  loading: "loading",
  ready: "ready",
} as const

export type FetchState = (typeof FetchState)[keyof typeof FetchState]
