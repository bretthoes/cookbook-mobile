import { InvitationStoreModel } from "./InvitationStore"

test("can be created", () => {
  const instance = InvitationStoreModel.create({})

  expect(instance).toBeTruthy()
})
