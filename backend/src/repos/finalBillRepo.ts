/* eslint-disable max-len */
import db from "@src/common/util/db";
import { FinalBillPublic } from "@src/types/finalBillType";

// Get all final bills
export async function getAllfinalBills_repo(): Promise<FinalBillPublic[]> {
  if (!db.isReady()) {
    await db.connect();
  }

  const result = await db.query(
    `SELECT * 
    FROM final_bill 
    ORDER BY bill_id ASC`
  );

  return result.rows as FinalBillPublic[];
}

// Get final bill by ID
export async function getfinalBillByID_repo(bill_id: number): Promise<FinalBillPublic | null> {
  if (!db.isReady()) {
    await db.connect();
  }

  const result = await db.query(
    `SELECT * 
    FROM final_bill 
    WHERE bill_id = $1`,
    [bill_id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as FinalBillPublic;
}

// Add new final bill
export async function addNewfinalBill_repo(record: Omit<FinalBillPublic, "bill_id" | "created_at">): Promise<number | null> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `
  INSERT INTO final_bill (
    user_id, booking_id, room_charges, total_service_charges, total_tax, total_discount,
    late_checkout_charge, total_amount, paid_amount, outstanding_amount
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING bill_id;`;

  const values = [
    record.user_id,
    record.booking_id,
    record.room_charges,
    record.total_service_charges,
    record.total_tax,
    record.total_discount,
    record.late_checkout_charge,
    record.total_amount,
    record.paid_amount,
    record.outstanding_amount,
  ];

  const result = await db.query(query, values);
  const newBillId = result.rows[0].bill_id as number;
  return newBillId;
}

// Update final bill info
export async function updatefinalBillInfo_repo(
  record: FinalBillPublic
): Promise<FinalBillPublic | null> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `UPDATE final_bill
    SET
      user_id = $1,
      booking_id = $2,
      room_charges = $3,
      total_service_charges = $4,
      total_tax = $5,
      total_discount = $6,
      late_checkout_charge = $7,
      total_amount = $8,
      paid_amount = $9,
      outstanding_amount = $10
    WHERE bill_id = $11
    RETURNING *;`;

  const values = [
    record.user_id,
    record.booking_id,
    record.room_charges,
    record.total_service_charges,
    record.total_tax,
    record.total_discount,
    record.late_checkout_charge,
    record.total_amount,
    record.paid_amount,
    record.outstanding_amount,
    record.bill_id
  ];

  const result = await db.query(query, values);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as FinalBillPublic;
}

// Delete final bill
export async function deletefinalBill_repo(bill_id: number): Promise<void> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = "DELETE FROM final_bill WHERE bill_id = $1";
  const values = [bill_id];
  await db.query(query, values);
}