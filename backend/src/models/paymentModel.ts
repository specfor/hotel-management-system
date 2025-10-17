import {
  addNewPayment_repo,
  deletePayment_repo,
  updatePaymentInfo_repo,
} from "@src/repos/paymentRepo";
import { getFinalBillByID_repo } from "@src/repos/finalBillRepo";
import { getPaymentByID_repo } from "@src/repos/paymentRepo";
import { PaymentPrivate, PaymentPublic } from "@src/types/paymentTypes";
import { FinalBillPublic } from "@src/types/finalBillTypes";

// Get current date/time in PostgreSQL TIMESTAMP format
function getCurrentTimestamp(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function addNewPayment_model(newPay: PaymentPrivate) {
  const finalBill = await getFinalBillByID_repo(newPay.bill_id);
  if (finalBill) {
    const timestamp = getCurrentTimestamp();
    newPay.date_time = timestamp;
    const { paid_amount } = newPay;
    const finalBill = await getFinalBillByID_repo(newPay.bill_id);
    // if (finalBill || typeof finalBill.outstanding_amount !== "number") {
    //   return {
    //     success: false,
    //     error: "Final bill not found or outstanding_amount missing",
    //   };
    // }
    const { outstanding_amount } = finalBill as FinalBillPublic;
    console.log(outstanding_amount)
    if (outstanding_amount < paid_amount) {
      return { success: false, error: "Paid amount is larger than Outstanding amount" };
    }

    const x = await addNewPayment_repo(newPay as PaymentPrivate);
    return { success: true, payment_id: x };
  } else {
    return { success: false, error: "Bill Id not found" };
  }
}

export async function updatePaymentInfo_model(
  record: PaymentPrivate,
  payment_id: number
) {
  const payment = await getPaymentByID_repo(payment_id);
  if (!payment) {
    return { success: false, error: "Payment not found" };
  }
  await updatePaymentInfo_repo(record, payment_id);
  return { success: true, payment_id: payment.payment_id };
}

export async function deletePayment_model(payment_id: number) {
  const payment = await getPaymentByID_repo(payment_id);
  if (!payment) {
    return { success: false, error: "Payment not found" };
  }
  await deletePayment_repo(payment_id);
  return { success: true, payment_id: payment.payment_id };
}
