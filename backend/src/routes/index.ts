import { Router } from "express";

import { getUsers } from "@src/controllers/userController";
import * as branchController from "@src/controllers/branchController";
import * as roomTypeController from "@src/controllers/roomTypeController";
import * as paymentController from "@src/controllers/paymentController";


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

// endpoints for payment
apiRouter.get("/payment", paymentController.getAllPayments);
apiRouter.get("/payment/:id", paymentController.getPaymentByID);
apiRouter.post("/payment", paymentController.addNewPayment);
apiRouter.put("/payment/:id", paymentController.updatePayment);
apiRouter.delete("/payment/:id", paymentController.deletePayment);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
