import db from "@src/common/util/db";
import {
  Revenue,
  RevenueCreate,
  RevenueUpdate,
  RevenueQueryParams,
} from "@src/types/revenueTypes";

//Get all revenue records with pagination and filtering
export async function getAllRevenue(params: RevenueQueryParams = {}): Promise<{
  revenue: Revenue[],
  totalCount: number,
}> {
  const {
    page = 1,
    limit = 30,
    branch_id,
    month,
    year,
    min_amount,
    max_amount,
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

  if (month !== undefined) {
    conditions.push(`month = $${paramIndex++}`);
    values.push(month);
  }

  if (year !== undefined) {
    conditions.push(`EXTRACT(YEAR FROM calculated_data_time) = $${paramIndex++}`);
    values.push(year);
  }

  if (min_amount !== undefined) {
    conditions.push(`amount >= $${paramIndex++}`);
    values.push(min_amount);
  }

  if (max_amount !== undefined) {
    conditions.push(`amount <= $${paramIndex++}`);
    values.push(max_amount);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count for pagination metadata
  const countQuery = `SELECT COUNT(*) FROM revenue ${whereClause}`;
  const countResult = await db.query(countQuery, values);
  const totalCount = parseInt(String(countResult.rows[0].count));

  // Get paginated results
  const dataQuery =
    "SELECT record_id, branch_id, month, calculated_data_time, amount " +
    `FROM revenue ${whereClause} ` +
    "ORDER BY calculated_data_time DESC, record_id DESC " +
    `LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

  const dataResult = await db.query(dataQuery, [...values, limit, offset]);

  return {
    revenue: dataResult.rows as Revenue[],
    totalCount,
  };
}

//Find revenue by ID
export async function findRevenueById(recordId: number): Promise<Revenue | null> {
  const result = await db.query(
    "SELECT record_id, branch_id, month, calculated_data_time, amount " +
      "FROM revenue WHERE record_id = $1",
    [recordId],
  );
  return (result.rows[0] as Revenue) || null;
}

//Get revenue by branch ID
export async function getRevenueByBranch(branchId: number): Promise<Revenue[]> {
  const result = await db.query(
    "SELECT record_id, branch_id, month, calculated_data_time, amount " +
      "FROM revenue WHERE branch_id = $1 ORDER BY calculated_data_time DESC",
    [branchId],
  );
  return result.rows as Revenue[];
}

//Get revenue by month
export async function getRevenueByMonth(month: number): Promise<Revenue[]> {
  const result = await db.query(
    "SELECT record_id, branch_id, month, calculated_data_time, amount " +
      "FROM revenue WHERE month = $1 ORDER BY calculated_data_time DESC",
    [month],
  );
  return result.rows as Revenue[];
}

//Create a new revenue record
export async function createRevenue(
  revenueData: RevenueCreate,
): Promise<Revenue> {
  const result = await db.query(
    "INSERT INTO revenue (branch_id, month, calculated_data_time, amount) " +
      "VALUES ($1, $2, $3, $4) " +
      "RETURNING record_id, branch_id, month, calculated_data_time, amount",
    [
      revenueData.branch_id,
      revenueData.month,
      revenueData.calculated_data_time,
      revenueData.amount,
    ],
  );
  return result.rows[0] as Revenue;
}

//Update revenue record
export async function updateRevenue(
  recordId: number,
  updates: RevenueUpdate,
): Promise<Revenue | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.branch_id !== undefined) {
    fields.push(`branch_id = $${paramIndex++}`);
    values.push(updates.branch_id);
  }
  if (updates.month !== undefined) {
    fields.push(`month = $${paramIndex++}`);
    values.push(updates.month);
  }
  if (updates.calculated_data_time !== undefined) {
    fields.push(`calculated_data_time = $${paramIndex++}`);
    values.push(updates.calculated_data_time);
  }
  if (updates.amount !== undefined) {
    fields.push(`amount = $${paramIndex++}`);
    values.push(updates.amount);
  }

  if (fields.length === 0) {
    return null; // No fields to update
  }

  values.push(recordId);
  const result = await db.query(
    `UPDATE revenue SET ${fields.join(", ")} ` +
      `WHERE record_id = $${paramIndex} ` +
      "RETURNING record_id, branch_id, month, calculated_data_time, amount",
    values,
  );

  return (result.rows[0] as Revenue) || null;
}

//Delete revenue record
export async function deleteRevenue(recordId: number): Promise<void> {
  await db.query("DELETE FROM revenue WHERE record_id = $1", [recordId]);
}
