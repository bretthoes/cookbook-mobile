import { describe, expect, it } from "vitest"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { getGeneralApiProblemFromResponse } from "@/services/api/apiProblem"
import { mapApiProblemToTxKey } from "@/utils/mapApiProblemToTxKey"

const cases: [GeneralApiProblem, string][] = [
  [{ kind: "timeout", temporary: true }, "errors:timeout"],
  [{ kind: "cannot-connect", temporary: true }, "errors:cannotConnect"],
  [{ kind: "server" }, "errors:server"],
  [{ kind: "unauthorized" }, "errors:unauthorized"],
  [{ kind: "notallowed" }, "errors:notAllowed"],
  [{ kind: "forbidden" }, "errors:forbidden"],
  [{ kind: "not-found" }, "errors:notFound"],
  [{ kind: "conflict" }, "errors:conflict"],
  [{ kind: "rate-limited" }, "errors:rateLimited"],
  [{ kind: "file-too-large" }, "errors:imageTooLarge"],
  [{ kind: "rejected" }, "errors:rejected"],
  [{ kind: "bad-data" }, "errors:badData"],
  [{ kind: "unknown", temporary: true }, "errors:unknown"],
]

describe("mapApiProblemToTxKey", () => {
  it.each(cases)("maps %j to %s", (problem, key) => {
    expect(mapApiProblemToTxKey(problem)).toBe(key)
  })
})

describe("getGeneralApiProblemFromResponse", () => {
  it("maps 401 notallowed detail", () => {
    const response = new Response(null, { status: 401 })
    expect(getGeneralApiProblemFromResponse(response, { detail: "notallowed" })).toEqual({
      kind: "notallowed",
    })
  })

  it("maps 429 to rate-limited", () => {
    const response = new Response(null, { status: 429 })
    expect(getGeneralApiProblemFromResponse(response)).toEqual({ kind: "rate-limited" })
  })

  it("maps 413 to file-too-large", () => {
    const response = new Response(null, { status: 413 })
    expect(getGeneralApiProblemFromResponse(response)).toEqual({ kind: "file-too-large" })
  })
})

describe("mapApiProblemToTxKey integration", () => {
  it("maps conflict problems with detail to errors:conflict", () => {
    const problem = getGeneralApiProblemFromResponse(new Response(null, { status: 409 }), {
      detail: "Duplicate",
    })
    expect(problem).toEqual({ kind: "conflict", detail: "Duplicate" })
    expect(mapApiProblemToTxKey(problem!)).toBe("errors:conflict")
  })
})
