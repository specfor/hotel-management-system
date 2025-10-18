import db from "@src/common/util/db";
import { User, UserRegister, UserPublic, UserQueryParams } from "@src/types/userTypes";

//Find user by username
export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await db.query('SELECT staff_id, username, password_hash FROM "user" WHERE username = $1', [username]);
  return (result.rows[0] as User) || null;
}

//Find user by staff ID
export async function findUserByStaffId(staffId: number): Promise<User | null> {
  const result = await db.query('SELECT staff_id, username, password_hash FROM "user" WHERE staff_id = $1', [staffId]);
  return (result.rows[0] as User) || null;
}

//Create a new user
export async function createUser(userData: UserRegister, passwordHash: string): Promise<UserPublic> {
  const result = await db.query(
    'INSERT INTO "user" (staff_id, username, password_hash) ' + "VALUES ($1, $2, $3) RETURNING staff_id, username",
    [userData.staff_id, userData.username, passwordHash]
  );
  return result.rows[0] as UserPublic;
}

//Get all users with pagination and filtering (without passwords)
export async function getAllUsers(params: UserQueryParams = {}): Promise<{
  users: UserPublic[];
  totalCount: number;
}> {
  const { page = 1, limit = 30, username } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build WHERE clause dynamically based on filters
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (username !== undefined) {
    conditions.push(`username ILIKE $${paramIndex++}`);
    values.push(`%${username}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count for pagination metadata
  const countQuery = `SELECT COUNT(*) FROM "user" ${whereClause}`;
  const countResult = await db.query(countQuery, values);
  const totalCount = parseInt(String(countResult.rows[0].count));

  // Get paginated results
  const dataQuery =
    "SELECT staff_id, username " +
    `FROM "user" ${whereClause} ` +
    "ORDER BY staff_id " +
    `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

  const dataResult = await db.query(dataQuery, [...values, limit, offset]);

  return {
    users: dataResult.rows as UserPublic[],
    totalCount,
  };
}

//Delete user by staff ID (also deletes associated logs)
export async function deleteUser(staffId: number): Promise<void> {
  // First delete all log records associated with this user
  await db.query("DELETE FROM log WHERE user_id = $1", [staffId]);

  // Then delete the user record
  await db.query('DELETE FROM "user" WHERE staff_id = $1', [staffId]);
}
