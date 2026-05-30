export type AuthResult = {
  tokenType: string
  accessToken: string
  expiresIn: number
  refreshToken: string
}

export type AuthResultSnapshotIn = AuthResult
