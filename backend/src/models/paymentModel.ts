import { addNewPayment_repo, deletePayment_repo, updatePaymentInfo_repo } from "@src/repos/paymentRepo";
import {
  getFinalBillByID_repo,
  updateFinalBillPaidAmount_repo,
  lockFinalBill,
  releaseFinalBill,
} from "@src/repos/finalBillRepo";
import { getPaymentByID_repo, getTotalPaidAmountByID_repo, getAllPaymentsByBillID_repo } from "@src/repos/paymentRepo";
import { PaymentPrivate, PaymentPublic } from "@src/types/paymentTypes";

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

async function updateFinalBillPaidAmount(bill_id: number) {
  const totalPaid = await getTotalPaidAmountByID_repo(bill_id);
  await updateFinalBillPaidAmount_repo(bill_id, totalPaid);
}

export async function getAllPaymentsByBillID_model(
  bill_id: number,
  method: string | undefined,
  reference: string | undefined,
  notes: string | undefined,
  date_time: string | undefined
): Promise<{
  success: boolean;
  payments?: PaymentPublic[] | null;
  error?: string;
}> {
  const finalBill = await getFinalBillByID_repo(bill_id);
  if (finalBill) {
    const payments = await getAllPaymentsByBillID_repo(bill_id, method, reference, notes, date_time);
    return { success: true, payments: payments };
  } else {
    return { success: false, error: "Bill Id not found" };
  }
}

export async function addNewPayment_model(newPay: PaymentPrivate) {
  // await lockFinalBill(newPay.bill_id);
  const finalBill = await getFinalBillByID_repo(newPay.bill_id);
  if (finalBill) {
    console.log("Final bill found:", finalBill);
    const timestamp = getCurrentTimestamp();
    newPay.date_time = timestamp;
    const { paid_amount } = newPay;
    const { outstanding_amount } = finalBill;

    if (outstanding_amount < paid_amount) {
      // await releaseFinalBill();
      return {
        success: false,
        error: "Paid amount is larger than Outstanding amount",
      };
    }

    const x = await addNewPayment_repo(newPay);
    await updateFinalBillPaidAmount(newPay.bill_id);
    // await releaseFinalBill();
    return { success: true, payment_id: x };
  } else {
    return { success: false, error: "Bill Id not found" };
  }
}

export async function updatePaymentInfo_model(record: PaymentPrivate, payment_id: number) {
  const payment = await getPaymentByID_repo(payment_id);
  if (!payment) {
    return { success: false, error: "Payment not found" };
  }
  await lockFinalBill(record.bill_id);
  if (payment.bill_id !== record.bill_id) {
    await lockFinalBill(payment.bill_id);
  }
  const finalBill = await getFinalBillByID_repo(record.bill_id);
  if (finalBill) {
    const { paid_amount } = record;
    const { outstanding_amount } = finalBill;
    const outstanding = outstanding_amount;
    const paid = paid_amount;
    if (outstanding < paid) {
      await releaseFinalBill();
      return {
        success: false,
        error: `Paid amount is larger than Outstanding amount for bill ${record.bill_id}`,
      };
    }
    await updatePaymentInfo_repo(record, payment_id);
    if (payment.bill_id != record.bill_id) {
      updateFinalBillPaidAmount(payment.bill_id); // for the previous bill
      updateFinalBillPaidAmount(record.bill_id); // for the new bill
      await releaseFinalBill();
      return { success: true, payment_id: payment.payment_id };
    }
    updateFinalBillPaidAmount(record.bill_id);
    await releaseFinalBill();
    return { success: true, payment_id: payment.payment_id };
  } else {
    return { success: false, error: "Bill Id not found" };
  }
}

export async function deletePayment_model(payment_id: number) {
  const payment = await getPaymentByID_repo(payment_id);
  if (!payment) {
    return { success: false, error: "Payment not found" };
  }
  const { bill_id } = payment;
  await deletePayment_repo(payment_id);
  await updateFinalBillPaidAmount(bill_id);
  return { success: true, payment_id: payment.payment_id };
}

export async function addNewPayments_model(newPay: PaymentPrivate) {
  await lockFinalBill(newPay.bill_id);
  const finalBill = await getFinalBillByID_repo(newPay.bill_id);
  if (finalBill) {
    console.log("Final bill found:", finalBill);
    const timestamp = getCurrentTimestamp();
    newPay.date_time = timestamp;
    const { paid_amount } = newPay;
    const { outstanding_amount } = finalBill;

    if (outstanding_amount < paid_amount) {
      await releaseFinalBill();
      return {
        success: false,
        error: "Paid amount is larger than Outstanding amount",
      };
    }

    const x = await addNewPayment_repo(newPay);
    await updateFinalBillPaidAmount(newPay.bill_id);
    await releaseFinalBill();
    return { success: true, payment_id: x };
  } else {
    return { success: false, error: "Bill Id not found" };
  }
}
