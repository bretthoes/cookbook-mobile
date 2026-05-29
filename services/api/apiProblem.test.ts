import { describe, expect, it } from "vitest"
import {
  getGeneralApiProblemFromError,
  getGeneralApiProblemFromResponse,
} from "@/services/api/apiProblem"

describe("getGeneralApiProblemFromResponse", () => {
  it("returns null for ok responses", () => {
    const response = new Response(null, { status: 200 })
    expect(getGeneralApiProblemFromResponse(response)).toBeNull()
  })

  it("returns null for non-error status codes below 400", () => {
    expect(getGeneralApiProblemFromResponse(new Response(null, { status: 304 }))).toBeNull()
  })

  it("maps 5xx to server", () => {
    expect(getGeneralApiProblemFromResponse(new Response(null, { status: 500 }))).toEqual({
      kind: "server",
    })
  })

  it("maps 401 to unauthorized by default", () => {
    expect(getGeneralApiProblemFromResponse(new Response(null, { status: 401 }))).toEqual({
      kind: "unauthorized",
    })
  })

  it("maps 401 with notallowed detail", () => {
    const response = new Response(null, { status: 401 })
    expect(getGeneralApiProblemFromResponse(response, { detail: "notallowed" })).toEqual({
      kind: "notallowed",
    })
    expect(getGeneralApiProblemFromResponse(response, { detail: "NotAllowed" })).toEqual({
      kind: "notallowed",
    })
  })

  it("maps 403, 404, 409, 429", () => {
    expect(getGeneralApiProblemFromResponse(new Response(null, { status: 403 }))).toEqual({
      kind: "forbidden",
    })
    expect(getGeneralApiProblemFromResponse(new Response(null, { status: 404 }))).toEqual({
      kind: "not-found",
    })
    expect(
      getGeneralApiProblemFromResponse(new Response(null, { status: 409 }), {
        detail: "Already exists",
      }),
    ).toEqual({ kind: "conflict", detail: "Already exists" })
    expect(getGeneralApiProblemFromResponse(new Response(null, { status: 429 }))).toEqual({
      kind: "rate-limited",
    })
  })

  it("maps other 4xx to rejected", () => {
    expect(getGeneralApiProblemFromResponse(new Response(null, { status: 418 }))).toEqual({
      kind: "rejected",
    })
  })
})

describe("getGeneralApiProblemFromError", () => {
  it("maps AbortError to timeout", () => {
    const error = new Error("aborted")
    error.name = "AbortError"
    expect(getGeneralApiProblemFromError(error)).toEqual({ kind: "timeout", temporary: true })
  })

  it("maps TypeError to cannot-connect", () => {
    expect(getGeneralApiProblemFromError(new TypeError("fetch failed"))).toEqual({
      kind: "cannot-connect",
      temporary: true,
    })
  })

  it("maps unknown errors to unknown", () => {
    expect(getGeneralApiProblemFromError(new Error("boom"))).toEqual({
      kind: "unknown",
      temporary: true,
    })
    expect(getGeneralApiProblemFromError("string error")).toEqual({
      kind: "unknown",
      temporary: true,
    })
  })
})
