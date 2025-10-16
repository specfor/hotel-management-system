/* eslint-disable max-len */
import { Router } from "express";

import { getUsers } from "@src/controllers/userController";
import * as branchController from "@src/controllers/branchController";
import * as roomTypeController from "@src/controllers/roomTypeController";
import * as serviceController from "@src/controllers/chargeableServiceController"; 
import * as bookingController from "@src/controllers/bookingController";
import * as serviceUsageController from "@src/controllers/serviceUsageController";

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// Get all users
apiRouter.get("/users", getUsers);

apiRouter.use("/api", apiRouter);

// endpoints for branch
apiRouter.get("/branch", branchController.getAllBranches);
apiRouter.get("/branch/:branchID", branchController.getBranchByID);
apiRouter.post("/branch", branchController.createBranch);
apiRouter.put("/branch/:branchID", branchController.updateBranch);
apiRouter.delete("/branch/:branchID", branchController.deleteBranch);

// endpoints for room-type
apiRouter.get("/room-type", roomTypeController.getAllRoomTypes);
apiRouter.get("/room-type/:branchID", roomTypeController.getRoomTypesByBranch);
apiRouter.post("/room-type", roomTypeController.createRoomType);
apiRouter.put("/room-type/:branchID/:roomTypeName", roomTypeController.updateRoomType);
apiRouter.delete("/room-type/:branchID/:roomTypeName", roomTypeController.deleteRoomType);

// endpoints for service
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
apiRouter.get("/booking/:bookingID", bookingController.getBookingByID);
apiRouter.post("/booking", bookingController.createBooking);
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
