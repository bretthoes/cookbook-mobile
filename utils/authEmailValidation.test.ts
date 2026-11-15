import { describe, expect, it } from "vitest"
import { getAuthEmailValidationTxKey } from "@/utils/authEmailValidation"

describe("getAuthEmailValidationTxKey", () => {
  it("accepts a plain address", () => {
    expect(getAuthEmailValidationTxKey("cook@example.com")).toBeUndefined()
  })

  it("accepts RFC 5322 symbols the server allows", () => {
    expect(getAuthEmailValidationTxKey("o'brien+tag@example.co.uk")).toBeUndefined()
  })

  it("rejects non-ASCII characters the server user name rejects", () => {
    expect(getAuthEmailValidationTxKey("josé@example.com")).toBe(
      "registerScreen:validation.emailInvalid",
    )
  })

  it("rejects an address without a domain dot", () => {
    expect(getAuthEmailValidationTxKey("cook@example")).toBe(
      "registerScreen:validation.emailInvalid",
    )
  })

  it("rejects a blank address", () => {
    expect(getAuthEmailValidationTxKey("")).toBe("registerScreen:validation.cantBeBlank")
  })

  it("rejects an address of 100 characters or more", () => {
    expect(getAuthEmailValidationTxKey(`${"a".repeat(90)}@example.com`)).toBe(
      "registerScreen:validation.emailTooLong",
    )
  })
})
