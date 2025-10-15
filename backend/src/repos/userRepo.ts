import db from "@src/common/util/db";
import { User, UserRegister, UserPublic } from "@src/types/userTypes";

//Find user by username
export async function findUserByUsername(
  username: string,
): Promise<User | null> {
  const result = await db.query(
    "SELECT staff_id, username, password_hash FROM \"user\" WHERE username = $1",
    [username],
  );
  return (result.rows[0] as User) || null;
}

//Find user by staff ID
export async function findUserByStaffId(
  staffId: number,
): Promise<User | null> {
  const result = await db.query(
    "SELECT staff_id, username, password_hash FROM \"user\" WHERE staff_id = $1",
    [staffId],
  );
  return (result.rows[0] as User) || null;
}

//Create a new user
export async function createUser(
  userData: UserRegister,
  passwordHash: string,
): Promise<UserPublic> {
  const result = await db.query(
    "INSERT INTO \"user\" (staff_id, username, password_hash) " +
      "VALUES ($1, $2, $3) RETURNING staff_id, username",
    [userData.staff_id, userData.username, passwordHash],
  );
  return result.rows[0] as UserPublic;
}

//Get all users (without passwords)
export async function getAllUsers(): Promise<UserPublic[]> {
  const result = await db.query("SELECT staff_id, username FROM \"user\"");
  return result.rows as UserPublic[];
}

//Delete user by staff ID
export async function deleteUser(staffId: number): Promise<void> {
  await db.query("DELETE FROM \"user\" WHERE staff_id = $1", [staffId]);
}
