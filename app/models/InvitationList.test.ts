import { InvitationListModel } from "./InvitationList"

test("can be created", () => {
  const instance = InvitationListModel.create({})

  expect(instance).toBeTruthy()
})
