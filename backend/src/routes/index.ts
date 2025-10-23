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
import {
  getRevenueRecords,
  getRevenueById,
  getRevenueByBranchId,
  getRevenueByMonthNumber,
  createRevenueRecord,
  updateRevenueRecord,
  deleteRevenueRecord,
} from "@src/controllers/revenueController";
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
import * as monthlyRevenueController from "@src/controllers/monthlyRevenueController";
import * as roomOccupancyController from "@src/controllers/roomOccupancyController";
import * as guestBillingController from "@src/controllers/guestBillingController";
import * as serviceReportController from "@src/controllers/serviceReportController";
import * as dashboardController from "@src/controllers/dashboardController";

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();
apiRouter.use("/api", apiRouter);

// Auth Routes (Public)

apiRouter.post("/auth/register", register);
apiRouter.post("/auth/login", login);

// User Routes (Protected by global auth middleware)

apiRouter.get("/users", getUsers);
apiRouter.get("/users/staff/:staffId", getUserByStaffId);
apiRouter.get("/users/username/:username", getUserByUsername);
apiRouter.delete("/users/:staffId", deleteUserByStaffId);

// Staff Routes (Protected by global auth middleware)

apiRouter.get("/staff", getStaffMembers);
apiRouter.get("/staff/:staffId", getStaffById);
apiRouter.get("/staff/branch/:branchId", getStaffByBranchId);
apiRouter.post("/staff", createStaffMember);
apiRouter.put("/staff/:staffId", updateStaffMember);
apiRouter.delete("/staff/:staffId", deleteStaffMember);

// Revenue Routes (Protected by global auth middleware)

apiRouter.get("/revenue", getRevenueRecords);
apiRouter.get("/revenue/:recordId", getRevenueById);
apiRouter.get("/revenue/branch/:branchId", getRevenueByBranchId);
apiRouter.get("/revenue/month/:month", getRevenueByMonthNumber);
apiRouter.post("/revenue", createRevenueRecord);
apiRouter.put("/revenue/:recordId", updateRevenueRecord);
apiRouter.delete("/revenue/:recordId", deleteRevenueRecord);

apiRouter.use("/api", apiRouter);
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
apiRouter.get("/payment/bill/:bill_id", paymentController.getAllPaymentsByBillID);
apiRouter.get("/payment/:id", paymentController.getPaymentByID);
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
apiRouter.get("/booking/availability", bookingController.checkRoomAvailability); // Uses query params: ?roomID=1&checkIn=...&checkOut=...
apiRouter.get("/booking", bookingController.getAllBookings);
apiRouter.post("/booking", bookingController.createBooking);
apiRouter.get("/booking/:bookingID", bookingController.getBookingByID);
apiRouter.put("/booking/:bookingID", bookingController.updateBooking);
apiRouter.delete("/booking/:bookingID", bookingController.deleteBooking);
apiRouter.get("/booking/:bookingID/services", serviceUsageController.getServicesByBookingID);


// endpoints for service-usage
apiRouter.get("/service-usage", serviceUsageController.getAllServiceUsage);
apiRouter.post("/service-usage", serviceUsageController.createServiceUsage);
apiRouter.get("/service-usage/:recordID", serviceUsageController.getServiceUsageByID);
apiRouter.put("/service-usage/:recordID", serviceUsageController.updateServiceUsage);
apiRouter.delete("/service-usage/:recordID", serviceUsageController.deleteServiceUsage);

// endpoint to get services associated with a booking

// endpoints for monthly revenue reports
apiRouter.get("/monthly-revenue", monthlyRevenueController.getMonthlyRevenue);

// endpoints for room occupancy reports
apiRouter.get("/room-occupancy", roomOccupancyController.getRoomOccupancy);
apiRouter.get("/room-occupancy/summary", roomOccupancyController.getOccupancySummary);

// endpoints for guest billing reports
apiRouter.get("/guest-billing", guestBillingController.getGuestBilling);
apiRouter.get("/guest-billing/summary", guestBillingController.getBillingSummary);

// endpoints for service reports
apiRouter.get("/service-usage-breakdown", serviceReportController.getServiceUsageBreakdown);
apiRouter.get("/top-services-trends", serviceReportController.getTopServicesTrends);
apiRouter.get("/service-usage-summary", serviceReportController.getServiceUsageSummary);
// endpoints for dashboard
apiRouter.get("/dashboard", dashboardController.getDashboardStats);

/******************************************************************************
 Export default
 ******************************************************************************/

export default apiRouter;
