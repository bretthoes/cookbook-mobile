import { MembershipListModel } from "./MembershipList"

test("can be created", () => {
  const instance = MembershipListModel.create({})

  expect(instance).toBeTruthy()
})
