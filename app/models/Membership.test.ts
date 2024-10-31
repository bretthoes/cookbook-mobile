import { MembershipModel } from "./Membership"

test("can be created", () => {
  const instance = MembershipModel.create({})

  expect(instance).toBeTruthy()
})
