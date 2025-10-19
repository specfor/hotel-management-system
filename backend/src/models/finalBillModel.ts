import { FinalBillInsert, FinalBillUpdate } from "@src/types/finalBillTypes";
import { BookingPublic } from "@src/types/bookingTypes";
import { UserPublic } from "@src/types/userTypes";
import { getUserByID_repo } from "@src/repos/userRepo";
import { getBookingByID_repo } from "@src/repos/bookingRepo";
import {
  getFinalBillByID_repo,
  getFinalBillByBookingID_repo,
  getRoomChargesData_repo,
  addNewFinalBill_repo,
  updateFinalBillInfo_repo,
  updateRoomCharges_repo,
  deleteFinalBill_repo,
  checkBillExistByID_repo,
} from "@src/repos/finalBillRepo";

/**
 * Calculate room charges for a given bill_id
 * Formula: daily_rate * (check_out - check_in) in days
 *
 * @param bill_id - The bill ID to calculate room charges for
 * @returns Promise<{ success: boolean; room_charges?: number; error?: string }>
 */
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

export async function addNewFinalBill_model(
  newBill: FinalBillInsert,
): Promise<{ success: boolean; bill_id?: number | null; error?: string }> {
  const final_bill = await getFinalBillByBookingID_repo(newBill.booking_id);
  if (final_bill) {
    return {
      success: false,
      error: "Final bill for this booking already exists",
    };
  } else {
    const user = await getUserByID_repo(newBill.user_id) as UserPublic | null;
    if (user) {
      const booking = await getBookingByID_repo(newBill.booking_id);
      if (booking) {
        const timestamp = getCurrentTimestamp();
        newBill.created_at = timestamp;
        const bill_id = await addNewFinalBill_repo(newBill);
        if (bill_id === null) {
          return { success: false, error: "Failed to create final bill" };
        }
        return { success: true, bill_id: bill_id };
      } else {
        return { success: false, error: "Booking ID not found" };
      }
    } else {
      return { success: false, error: "User ID not found" };
    }
  }
}

export async function updatefinalBillInfo_model(
  bill_id: number,
  record: FinalBillUpdate
): Promise<{ success: boolean; bill_id?: number | null; error?: string }> {
  const bill = await getFinalBillByID_repo(bill_id);
  if (bill) {
    const user = await getUserByID_repo(record.user_id);
    if (user) {
      const booking = await getBookingByID_repo(record.booking_id);
      if (booking) {
        const timestamp = getCurrentTimestamp();
        record.created_at = timestamp;
        const bill_id = await updateFinalBillInfo_repo(record);
        if (bill_id === null) {
          return { success: false, error: "Failed to update final bill" };
        }
        return { success: true, bill_id: bill_id };
      } else {
        return { success: false, error: "Booking ID not found" };
      }
    } else {
      return { success: false, error: "User ID not found" };
    }
  } else {
    return { success: false, error: "Bill ID not found" };
  }
}

export async function deleteFinalBill_model(
  bill_id: number
): Promise<{ success: boolean; error?: string }> {
  const billExists = await checkBillExistByID_repo(bill_id);
  if (!billExists) {
    return { success: false, error: "Bill ID not found" };
  }

  await deleteFinalBill_repo(bill_id);
  return { success: true };
}

//////////////////////////////////////////////////////////////////////////////


export async function calculateRoomCharges(bill_id: number): Promise<{
  success: boolean;
  room_charges?: number;
  error?: string;
}> {
  try {
    // Get room charges data from database
    const roomData = await getRoomChargesData_repo(bill_id);

    if (!roomData) {
      return {
        success: false,
        error: `Bill with ID ${bill_id} not found or missing related data`,
      };
    }

    const { daily_rate, check_in, check_out } = roomData;

    // Validate dates
    if (!check_in || !check_out) {
      return {
        success: false,
        error: `Missing check_in or check_out dates for bill ${bill_id}`,
      };
    }

    // Calculate the difference in days
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    // Validate date objects
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return {
        success: false,
        error: `Invalid date format for bill ${bill_id}`,
      };
    }

    // Calculate difference in milliseconds and convert to days
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    if (daysDifference <= 0) {
      return {
        success: false,
        error: "Invalid date range: check_out must be after check_in",
      };
    }

    // Calculate room charges: daily_rate * number of days
    const roomCharges = daily_rate * daysDifference;

    return {
      success: true,
      room_charges: Number(roomCharges.toFixed(2)),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred in calculation",
    };
  }
}

/**
 * Update room charges for a specific bill
 *
 * @param bill_id - The bill ID to update
 * @returns Promise<{ success: boolean; room_charges?: number; error?: string }>
 */
export async function updateRoomCharges(bill_id: number): Promise<{
  success: boolean;
  room_charges?: number;
  error?: string;
}> {
  try {
    // First calculate the room charges
    const calculationResult = await calculateRoomCharges(bill_id);

    if (!calculationResult.success) {
      return calculationResult;
    }

    // Update the database with calculated room charges
    const updateResult = await updateRoomCharges_repo(
      bill_id,
      calculationResult.room_charges!
    );

    return updateResult;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred in update",
    };
  }
}
