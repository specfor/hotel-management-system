/* eslint-disable max-len */
import { Router } from "express";
import { getUsers, getUserByStaffId, getUserByUsername, deleteUserByStaffId } from "@src/controllers/userController";
import { register, login } from "@src/controllers/authController";
import {
  getStaffMembers,
  getStaffById,
  getStaffByBranchId,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
} from "@src/controllers/staffController";
import * as branchController from "@src/controllers/branchController";
import * as roomTypeController from "@src/controllers/roomTypeController";
import * as paymentController from "@src/controllers/paymentController";
import * as finalBillController from "@src/controllers/finalBillController";
import * as roomController from "@src/controllers/roomController";
import * as discountController from "@src/controllers/discountController";
import * as serviceController from "@src/controllers/chargeableServiceController";
import * as bookingController from "@src/controllers/bookingController";
import * as serviceUsageController from "@src/controllers/serviceUsageController";
import * as guestController from "@src/controllers/guestController";

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();
apiRouter.use("/api", apiRouter);

// Auth Routes (Public)

apiRouter.post("/auth/register", register);
apiRouter.post("/auth/login", login);

// User Routes (Public)

apiRouter.get("/users", getUsers);
apiRouter.get("/users/staff/:staffId", getUserByStaffId);
apiRouter.get("/users/username/:username", getUserByUsername);
apiRouter.delete("/users/:staffId", deleteUserByStaffId);

// Staff Routes (Public)

apiRouter.get("/staff", getStaffMembers);
apiRouter.get("/staff/:staffId", getStaffById);
apiRouter.get("/staff/branch/:branchId", getStaffByBranchId);
apiRouter.post("/staff", createStaffMember);
apiRouter.put("/staff/:staffId", updateStaffMember);
apiRouter.delete("/staff/:staffId", deleteStaffMember);

// endpoints for guest
apiRouter.get("/guest", guestController.getAllGuests);
apiRouter.get("/guest/:id", guestController.getGuestByID);
apiRouter.post("/guest", guestController.addNewGuest);
apiRouter.put("/guest/:id", guestController.updateGuestInfo);
apiRouter.put("/guest/:id/psw", guestController.changeGuestPassword);
apiRouter.delete("/guest/:id", guestController.deleteGuest);

// apiRouter.use("/api", apiRouter);
// endpoints for branch
apiRouter.get("/branch", branchController.getAllBranches);
apiRouter.get("/branch/:branchId", branchController.getBranchByID);
apiRouter.post("/branch", branchController.createBranch);
apiRouter.put("/branch/:branchId", branchController.updateBranch);
apiRouter.delete("/branch/:branchId", branchController.deleteBranch);

// endpoints for room-type
apiRouter.get("/room-type", roomTypeController.getAllRoomTypes);
apiRouter.get("/room-type/:branchId", roomTypeController.getRoomTypesByBranch);
apiRouter.post("/room-type", roomTypeController.createRoomType);
apiRouter.put("/room-type/:branchId/:roomTypeName", roomTypeController.updateRoomType);
apiRouter.delete("/room-type/:branchId/:roomTypeName", roomTypeController.deleteRoomType);

// endpoints for payment
apiRouter.get("/payment", paymentController.getAllPayments);
apiRouter.get("/payment/:id", paymentController.getAllPaymentsByBillID);
apiRouter.post("/payment", paymentController.addNewPayment);
apiRouter.put("/payment/:id", paymentController.updatePayment);
apiRouter.delete("/payment/:id", paymentController.deletePayment);

// endpoints for finalBill
apiRouter.get("/final-bill", finalBillController.getAllFinalBills);
apiRouter.get("/final-bill/:booking_id", finalBillController.getFinalBillByBookingID);
apiRouter.post("/final-bill", finalBillController.addNewFinalBill);
apiRouter.put("/final-bill/:bill_id", finalBillController.updateFinalBill);
apiRouter.delete("/final-bill/:bill_id", finalBillController.deleteFinalBill);

// endpoints for room
apiRouter.get("/room", roomController.getAllRooms);
apiRouter.get("/branch/:branchId/room", roomController.getRoomsByBranch);
apiRouter.post("/branch/:branchId/room", roomController.createRoom);
apiRouter.put("/room/:roomId", roomController.updateRoom);
apiRouter.delete("/room/:roomId", roomController.deleteRoom);

// endpoints for discounts
apiRouter.get("/discount", discountController.getAllDiscounts);
apiRouter.get("/discount/:discountId", discountController.getDiscountById);
apiRouter.get("/discount/branch/:branchId", discountController.getDiscountsByBranch);
apiRouter.post("/discount", discountController.createDiscount);
apiRouter.put("/discount/:discountId", discountController.updateDiscount);
apiRouter.delete("/discount/:discountId", discountController.deleteDiscount); // endpoints for service
apiRouter.get("/service", serviceController.getAllChargeableServices);
apiRouter.post("/service", serviceController.createChargeableService);
apiRouter.get("/service/:serviceID", serviceController.getChargeableServiceByID);
apiRouter.put("/service/:serviceID", serviceController.updateChargeableService);
apiRouter.delete("/service/:serviceID", serviceController.deleteChargeableService);

// endpoints for booking
apiRouter.get("/booking/guest/:guestID", bookingController.getBookingsByGuestID);
apiRouter.get("/booking/room/:roomID", bookingController.getBookingsByRoomID);
apiRouter.get("/booking/availability", bookingController.checkRoomAvailability); // Uses query params: ?roomID=1&checkIn=...&checkOut=...
apiRouter.get("/booking", bookingController.getAllBookings);
apiRouter.post("/booking", bookingController.createBooking);
apiRouter.get("/booking/:bookingID", bookingController.getBookingByID);
apiRouter.put("/booking/:bookingID", bookingController.updateBooking);
apiRouter.delete("/booking/:bookingID", bookingController.deleteBooking);

// endpoints for service-usage
apiRouter.get("/service-usage", serviceUsageController.getAllServiceUsage);
apiRouter.post("/service-usage", serviceUsageController.createServiceUsage);
apiRouter.get("/service-usage/:usageID", serviceUsageController.getServiceUsageByID);
apiRouter.put("/service-usage/:usageID", serviceUsageController.updateServiceUsage);
apiRouter.delete("/service-usage/:usageID", serviceUsageController.deleteServiceUsage);

/******************************************************************************
 Export default
 ******************************************************************************/

export default apiRouter;
