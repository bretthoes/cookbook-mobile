import type { ApiResult } from "@/services/api/toApiResult"
import type { GeneralApiProblem } from "@/services/api/apiProblem"

export class ApiQueryError extends Error {
  readonly problem: GeneralApiProblem

  constructor(problem: GeneralApiProblem) {
    super(problem.kind)
    this.name = "ApiQueryError"
    this.problem = problem
  }
}

export function unwrapApiResult<T extends Record<string, unknown>>(
  result: ApiResult<T>,
): T & { kind: "ok" } {
  if (result.kind !== "ok") {
    throw new ApiQueryError(result)
  }
  return result
}
