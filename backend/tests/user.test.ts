import { addNewUser2 } from "@src/models/userModel";
import { expect, test } from "vitest";

test("create new user test", () => {
  expect(addNewUser2({ name: "gaeg", email: "gaega", password: "gaega" })).toEqual({ user: "bla" });
});
