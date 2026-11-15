import { describe, expect, it } from "vitest"
import { getRegisterErrorTxKey } from "@/utils/registerErrorTxKey"

describe("getRegisterErrorTxKey", () => {
  it("maps a duplicate user name to the already-registered message", () => {
    expect(
      getRegisterErrorTxKey({ kind: "validation", codes: ["DuplicateUserName", "DuplicateEmail"] }),
    ).toBe("registerScreen:errors.emailRegistered")
  })

  it("maps an invalid user name to the invalid email message", () => {
    expect(getRegisterErrorTxKey({ kind: "validation", codes: ["InvalidUserName"] })).toBe(
      "registerScreen:errors.invalidEmail",
    )
  })

  it("maps password policy failures to the password message", () => {
    expect(
      getRegisterErrorTxKey({ kind: "validation", codes: ["PasswordRequiresNonAlphanumeric"] }),
    ).toBe("registerScreen:errors.passwordRejected")
  })

  it("maps 429 to the too-many-attempts message", () => {
    expect(getRegisterErrorTxKey({ kind: "rate-limited" })).toBe("errors:tooManyAttempts")
  })

  it("maps unknown validation codes to the generic message", () => {
    expect(getRegisterErrorTxKey({ kind: "validation", codes: [] })).toBe(
      "registerScreen:errors.generic",
    )
  })
})
