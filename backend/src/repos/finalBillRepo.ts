import db from "@src/common/util/db";

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