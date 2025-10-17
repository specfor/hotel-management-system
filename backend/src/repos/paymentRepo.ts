import db from "@src/common/util/db";
import { PaymentPrivate, PaymentPublic } from "@src/types/paymentTypes";

export async function getAllPayments_repo(): Promise<PaymentPublic[] | null> {
  if (!db.isReady()) {
    await db.connect();
  }

  const result = await db.query(
    `SELECT * 
    FROM payment 
    ORDER BY payment_id ASC`
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows as PaymentPublic[];
}

export async function getPaymentByID_repo(
  id: number
): Promise<PaymentPublic | null> {
  if (!db.isReady()) {
    await db.connect();
  }

  const result = await db.query(
    `SELECT *
    FROM payment 
    WHERE payment_id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as PaymentPublic;
}

export async function addNewPayment_repo(
  record: PaymentPrivate
): Promise<number | null> {
  if (!db.isReady()) {
    await db.connect();
  }

  const query = `insert into payment (bill_id, paid_method, paid_amount, date_time) values
                  ($1, $2, $3, $4)
                  RETURNING "payment_id";`;

  const values = [
    record.bill_id,
    record.paid_method,
    record.paid_amount,
    record.date_time,
  ];

  const result = await db.query(query, values);
  const newpayment_id = result.rows[0].payment_id as number;
  return newpayment_id;
}

export async function updatePaymentInfo_repo(
  record: PaymentPrivate,
  payment_id: number
): Promise<PaymentPublic | null> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = `UPDATE payment
      SET
        bill_id = $1, 
        paid_method = $2, 
        paid_amount = $3
      WHERE payment_id = $4
      RETURNING payment_id, bill_id, paid_method, paid_amount;`;

  const values = [
    record.bill_id,
    record.paid_method,
    record.paid_amount,
    payment_id,
  ];

  const result = await db.query(query, values);

  return result.rows[0] as PaymentPublic;
}

export async function deletePayment_repo(id: number): Promise<void> {
  if (!db.isReady()) {
    await db.connect();
  }
  const query = "DELETE FROM payment WHERE payment_id = $1";
  const values = [id];
  await db.query(query, values);
}
