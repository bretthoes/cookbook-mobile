import { describe, expect, it } from "vitest"
import { toOkResult, toProblemFromError, toProblemFromResponse } from "@/services/api/toApiResult"

describe("toOkResult", () => {
  it("spreads data with kind ok", () => {
    expect(toOkResult({ recipe: { id: 1 } })).toEqual({
      kind: "ok",
      recipe: { id: 1 },
    })
  })
})

describe("toProblemFromResponse", () => {
  it("delegates to response mapper", () => {
    const response = new Response(null, { status: 404 })
    expect(toProblemFromResponse(response)).toEqual({ kind: "not-found" })
  })

  it("falls back to rejected when mapper returns null", () => {
    const response = new Response(null, { status: 399 })
    expect(toProblemFromResponse(response)).toEqual({ kind: "rejected" })
  })
})

describe("toProblemFromError", () => {
  it("delegates to error mapper", () => {
    const error = new Error("aborted")
    error.name = "AbortError"
    expect(toProblemFromError(error)).toEqual({ kind: "timeout", temporary: true })
  })

  it("always returns a problem (never null)", () => {
    expect(toProblemFromError(new Error("other"))).toEqual({
      kind: "unknown",
      temporary: true,
    })
  })
})

describe("toProblemFromResponse with body", () => {
  it("passes conflict detail through", () => {
    const response = new Response(null, { status: 409 })
    expect(toProblemFromResponse(response, { detail: "exists" })).toEqual({
      kind: "conflict",
      detail: "exists",
    })
  })
})
