// export async function getUserWithGivenEmail(email: string) {
//   let sql = "SELECT id, name, email FROM users WHERE email = ?";
//   let params = [email];
//   // execute sql query and return user if found

import { UserPublic, UserRepo } from "@src/types/userTypes";

//   return { id: 1, name: "Test User", email: "test@example.com" };
// }

export default function addNewUser(user: UserRepo): Promise<UserPublic | null> {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    const params = [user.name, user.email, user.password];
    // execute sql query and return user if created
    resolve({ id: 1, name: user.name, email: user.email });
  });
}
