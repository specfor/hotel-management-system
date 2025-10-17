import db from "@src/common/util/db";
import { FinalBillPublic } from "@src/types/finalBillTypes";

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