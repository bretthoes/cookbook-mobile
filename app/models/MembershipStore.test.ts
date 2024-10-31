import { MembershipStoreModel } from "./MembershipStore"

test("can be created", () => {
  const instance = MembershipStoreModel.create({})

  expect(instance).toBeTruthy()
})
