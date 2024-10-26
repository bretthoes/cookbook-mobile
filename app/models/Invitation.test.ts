import { InvitationModel } from "./Invitation"

test("can be created", () => {
  const instance = InvitationModel.create({})

  expect(instance).toBeTruthy()
})
