import { addNewPayment_repo } from "@src/repos/paymentRepo";
import { checkBillExistByID_repo, getFinalBillByID_repo } from "@src/repos/finalBillRepo";
import { PaymentPublic } from "@src/types/paymentTypes";

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

export async function addNewPayment_model(newPay: PaymentPublic) {
  if (await checkBillExistByID_repo(newPay.bill_id)) {
    const timestamp = getCurrentTimestamp();
    newPay.date_time = timestamp;
    const {paid_amount} = newPay;
    const finalBill = await getFinalBillByID_repo(newPay.bill_id);
    if (!finalBill || typeof finalBill.outstanding_amount !== "number") {
      return { success: false, error: "Final bill not found or outstanding_amount missing" };
    }
    const { outstanding_amount } = finalBill;
    if (outstanding_amount < paid_amount) {
      const excess_amount = paid_amount - outstanding_amount;
      const x = await addNewPayment_repo(newPay);
      newPay.paid_amount = -excess_amount;
      const y = await addNewPayment_repo(newPay);
      return { success: true, payment_id: x };
    }
    if (outstanding_amount === paid_amount){
      const x = await addNewPayment_repo(newPay);
      return { success: true, payment_id: x };
    }
    if(outstanding_amount > paid_amount){
      const x = await addNewPayment_repo(newPay);
      return { success: true, payment_id: x };
    }
    return { success: false, error: "something went wrong" };
  } else {
    return { success: false, error: "Bill Id not found" };
  }
}
