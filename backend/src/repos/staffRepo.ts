import db from "@src/common/util/db";
import { Staff, StaffCreate, StaffUpdate, StaffQueryParams } from "@src/types/staffTypes";

//Get all staff members with pagination and filtering
export async function getAllStaff(params: StaffQueryParams = {}): Promise<{
  staff: Staff[],
  totalCount: number,
}> {
  const {
    page = 1,
    limit = 30,
    branch_id,
    job_title,
    name,
  } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build WHERE clause dynamically based on filters
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (branch_id !== undefined) {
    conditions.push(`branch_id = $${paramIndex++}`);
    values.push(branch_id);
  }

  if (job_title !== undefined) {
    conditions.push(`job_title ILIKE $${paramIndex++}`);
    values.push(`%${job_title}%`);
  }

  if (name !== undefined) {
    conditions.push(`name ILIKE $${paramIndex++}`);
    values.push(`%${name}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count for pagination metadata
  const countQuery = `SELECT COUNT(*) FROM staff ${whereClause}`;
  const countResult = await db.query(countQuery, values);
  const totalCount = parseInt(String(countResult.rows[0].count));

  // Get paginated results
  const dataQuery =
    "SELECT staff_id, branch_id, name, contact_no, email, job_title, salary " +
    `FROM staff ${whereClause} ` +
    "ORDER BY staff_id " +
    `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

  const dataResult = await db.query(dataQuery, [...values, limit, offset]);

  return {
    staff: dataResult.rows as Staff[],
    totalCount,
  };
}

//Find staff by ID
export async function findStaffById(staffId: number): Promise<Staff | null> {
  const result = await db.query(
    "SELECT staff_id, branch_id, name, contact_no, email, job_title, salary " +
      "FROM staff WHERE staff_id = $1",
    [staffId],
  );
  return (result.rows[0] as Staff) || null;
}

//Find staff by email
export async function findStaffByEmail(email: string): Promise<Staff | null> {
  const result = await db.query(
    "SELECT staff_id, branch_id, name, contact_no, email, job_title, salary " +
      "FROM staff WHERE email = $1",
    [email],
  );
  return (result.rows[0] as Staff) || null;
}

//Get staff by branch ID
export async function getStaffByBranch(branchId: number): Promise<Staff[]> {
  const result = await db.query(
    "SELECT staff_id, branch_id, name, contact_no, email, job_title, salary " +
      "FROM staff WHERE branch_id = $1 ORDER BY staff_id",
    [branchId],
  );
  return result.rows as Staff[];
}

//Create a new staff member
export async function createStaff(
  staffData: StaffCreate,
): Promise<Staff> {
  const result = await db.query(
    "INSERT INTO staff (branch_id, name, contact_no, email, job_title, salary) " +
      "VALUES ($1, $2, $3, $4, $5, $6) " +
      "RETURNING staff_id, branch_id, name, contact_no, email, job_title, salary",
    [
      staffData.branch_id,
      staffData.name,
      staffData.contact_no,
      staffData.email,
      staffData.job_title,
      staffData.salary,
    ],
  );
  return result.rows[0] as Staff;
}

//Update staff member
export async function updateStaff(
  staffId: number,
  updates: StaffUpdate,
): Promise<Staff | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.branch_id !== undefined) {
    fields.push(`branch_id = $${paramIndex++}`);
    values.push(updates.branch_id);
  }
  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.contact_no !== undefined) {
    fields.push(`contact_no = $${paramIndex++}`);
    values.push(updates.contact_no);
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(updates.email);
  }
  if (updates.job_title !== undefined) {
    fields.push(`job_title = $${paramIndex++}`);
    values.push(updates.job_title);
  }
  if (updates.salary !== undefined) {
    fields.push(`salary = $${paramIndex++}`);
    values.push(updates.salary);
  }

  if (fields.length === 0) {
    return null; // No fields to update
  }

  values.push(staffId);
  const result = await db.query(
    `UPDATE staff SET ${fields.join(", ")} ` +
      `WHERE staff_id = $${paramIndex} ` +
      "RETURNING staff_id, branch_id, name, contact_no, email, job_title, salary",
    values,
  );

  return (result.rows[0] as Staff) || null;
}

//Delete staff member (also deletes associated user and logs if they exist)
export async function deleteStaff(staffId: number): Promise<void> {
  // First delete all log records associated with this user (staff_id)
  await db.query("DELETE FROM log WHERE user_id = $1", [staffId]);
  
  // Then delete the user record if it exists (foreign key constraint)
  await db.query("DELETE FROM \"user\" WHERE staff_id = $1", [staffId]);
  
  // Finally delete the staff record
  await db.query("DELETE FROM staff WHERE staff_id = $1", [staffId]);
}
