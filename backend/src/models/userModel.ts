// TODO: Import actual user repository functions when implemented
// import addNewUser from "@src/repos/userRepo";

export interface User {
  name: string;
  email: string;
  password: string;
}

export function addNewUser2(/* user: User */): { user: string } {
  // user validations
  // TODO: Implement actual user validation logic
  // check for existing user with same email

  return { user: "hola" };
}
