import db from "@src/common/util/db";
import {
  FinalBillPublic,
  FinalBillInsert,
  FinalBillUpdate,
} from "@src/types/finalBillTypes";

export async function checkBillExistByID_repo(bill_id: number) {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `
    SELECT EXISTS (
        SELECT 1
        FROM final_bill
        WHERE bill_id = $1
    ) AS record_exists;
  `;

  const { rows } = await db.query(query, [bill_id]);
  return rows[0].record_exists as boolean;
}

// Get all final bills
export async function getAllFinalBills_repo(): Promise<FinalBillPublic[]> {
  if (!db.isReady()) {
    await db.connect();
  }

  const result = await db.query(
    `SELECT * 
    FROM final_bill 
    ORDER BY bill_id ASC`,
  );

  return result.rows as FinalBillPublic[];
}
// Get final bill by id
export async function getFinalBillByID_repo(
  bill_id: number,
): Promise<FinalBillPublic | null> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `
    SELECT *
    FROM final_bill
    WHERE bill_id = $1
  `;

  const { rows } = await db.query(query, [bill_id]);
  if (rows.length === 0) {
    return null;
  }
  return rows[0] as FinalBillPublic;
}

export async function getFinalBillByBookingID_repo(
  booking_id: number,
): Promise<FinalBillPublic | null> {
  if (!db.isReady()) {
    await db.connect();
  }

  const query = `
    SELECT *
    FROM final_bill
    WHERE booking_id = $1
  `;

  const { rows } = await db.query(query, [booking_id]);
  if (rows.length === 0) {
    return null;
  }
  return rows[0] as FinalBillPublic;
}

// Add new final bill
export async function addNewFinalBill_repo(
  record: FinalBillInsert,
): Promise<number | null> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `
  INSERT INTO final_bill (
    user_id, booking_id
  ) VALUES ($1, $2)
  RETURNING bill_id;`;

  const values = [
    record.user_id,
    record.booking_id,
  ];
   
  const result = await db.query(query, values);
  const newBillId = result.rows[0].bill_id as number;
  return newBillId;
}

// Update final bill info
export async function updateFinalBillInfo_repo(
  record: FinalBillUpdate,
): Promise<number | null> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `UPDATE final_bill
    SET
      user_id = $1,
      booking_id = $2,
    WHERE bill_id = $3
    RETURNING *;`;

  const values = [
    record.user_id,
    record.booking_id,
    record.bill_id,
  ];

  const result = await db.query(query, values);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].bill_id as number;
}

// Delete final bill
export async function deleteFinalBill_repo(bill_id: number): Promise<void> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = "DELETE FROM final_bill WHERE bill_id = $1";
  const values = [bill_id];
  await db.query(query, values);
}

// Update final bill paid amount
export async function updateFinalBillPaidAmount_repo(
  bill_id: number,
  totalPaidAmount: number,
): Promise<void> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `
    UPDATE final_bill
    SET paid_amount = $2,
        outstanding_amount = total_amount - $2
    WHERE bill_id = $1
  `;
  await db.query(query, [bill_id, totalPaidAmount]);
}

///////////////////////////////////////////////////////////////////////////////////


// Get room charges data for calculation
export async function getRoomChargesData_repo(bill_id: number): Promise<{
  daily_rate: number,
  check_in: string,
  check_out: string,
} | null> {
  if (!db.isReady()) {
    await db.connect();
  }

  const query = `
    SELECT 
      rt.daily_rate,
      b.check_in,
      b.check_out
    FROM final_bill fb
    JOIN booking b ON fb.booking_id = b.booking_id
    JOIN room r ON b.room_id = r.room_id
    JOIN room_type rt ON r.type_id = rt.type_id
    WHERE fb.bill_id = $1
  `;

  const result = await db.query(query, [bill_id]);

  if (result.rows.length === 0) {
    return null;
  }

  const { daily_rate, check_in, check_out } = result.rows[0];

  return {
    daily_rate: Number(daily_rate),
    check_in: check_in as string,
    check_out: check_out as string,
  };
}

// Update room charges in database
export async function updateRoomCharges_repo(
  bill_id: number,
  room_charges: number,
): Promise<{ success: boolean, room_charges?: number, error?: string }> {
  if (!db.isReady()) {
    await db.connect();
  }

  try {
    const updateQuery = `
      UPDATE final_bill 
      SET room_charges = $1 
      WHERE bill_id = $2
      RETURNING room_charges
    `;

    const result = await db.query(updateQuery, [room_charges, bill_id]);

    if (result.rows.length === 0) {
      return { success: false, error: `Bill with ID ${bill_id} not found` };
    }

    return {
      success: true,
      room_charges: Number(result.rows[0].room_charges),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database error occurred",
    };
  }
}

