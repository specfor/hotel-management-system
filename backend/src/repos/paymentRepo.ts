import db from "@src/common/util/db";
import { PaymentPrivate, PaymentPublic } from "@src/types/paymentTypes";

export async function getAllPayments_repo(): Promise<PaymentPublic[] | null> {
  if (!db.isReady()) {
    await db.connect();
  }

  const result = await db.query(
    `SELECT * 
    FROM payment 
    ORDER BY payment_id ASC`,
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows as PaymentPublic[];
}

export async function getAllPaymentsByBillID_repo(
  bill_id: number,
  method: string | undefined,
  reference: string | undefined,
  notes: string | undefined,
  date_time: string | undefined,
): Promise<PaymentPublic[] | null> {
  if (!db.isReady()) {
    await db.connect();
  }

  // start building the query
  let query = `
    SELECT *
    FROM payment
    WHERE bill_id = $1`;
  const values: (number | string | null)[] = [bill_id];
  let idx = 2;

  if (method) {
    query += ` AND method = $${idx}`;
    values.push(method);
    idx++;
  }
  if (reference) {
    query += ` AND reference = $${idx}`;
    values.push(reference);
    idx++;
  }
  if (notes) {
    query += ` AND notes = $${idx}`;
    values.push(notes);
    idx++;
  }
  if (date_time) {
    query += ` AND date_time = $${idx}`;
    values.push(date_time);
  }

  // Descending order by date_time
  query += " ORDER BY date_time DESC";

  const result = await db.query(query, values);
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows as PaymentPublic[];
}

export async function getPaymentByID_repo(
  id: number,
): Promise<PaymentPublic | null> {
  if (!db.isReady()) {
    await db.connect();
  }

  const result = await db.query(
    `SELECT *
    FROM payment 
    WHERE payment_id = $1`,
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as PaymentPublic;
}

export async function addNewPayment_repo(
  record: PaymentPrivate,
): Promise<number | null> {
  if (!db.isReady()) {
    await db.connect();
  }

  const query = `
    insert into payment (bill_id, paid_method, paid_amount, notes, date_time) values
      ($1, $2, $3, $4, $5)
    RETURNING "payment_id";`;

  const values = [
    record.bill_id,
    record.paid_method,
    record.paid_amount,
    record.notes,
    record.date_time,
  ];

  const result = await db.query(query, values);
  const newpayment_id = result.rows[0].payment_id as number;
  return newpayment_id;
}

export async function updatePaymentInfo_repo(
  record: PaymentPrivate,
  payment_id: number,
): Promise<number | null> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `UPDATE payment
      SET
        bill_id = $1, 
        paid_method = $2, 
        paid_amount = $3,
        notes = $4
      WHERE payment_id = $5
      RETURNING payment_id`;

  const values = [
    record.bill_id,
    record.paid_method,
    record.paid_amount,
    record.notes,
    payment_id,
  ];

  const result = await db.query(query, values);

  return result.rows[0].payment_id as number;
}

export async function deletePayment_repo(id: number): Promise<void> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = "DELETE FROM payment WHERE payment_id = $1";
  const values = [id];
  await db.query(query, values);
}

export async function getTotalPaidAmountByID_repo(
  bill_id: number,
): Promise<number> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `
    SELECT COALESCE(SUM(paid_amount), 0) AS total_paid
    FROM payment
    WHERE bill_id = $1
  `;
  const result = await db.query(query, [bill_id]);
  return result.rows[0].total_paid as number;
}
