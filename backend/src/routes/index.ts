 
import { Router } from "express";
import { getUsers } from "@src/controllers/userController";
import * as branchController from "@src/controllers/branchController";
import * as roomTypeController from "@src/controllers/roomTypeController";
import * as paymentController from "@src/controllers/paymentController";
import * as roomController from "@src/controllers/roomController";
import * as discountController from "@src/controllers/discountController";

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// Get all users
apiRouter.get("/users", getUsers);

apiRouter.use("/api", apiRouter);

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
apiRouter.get("/payment/:id", paymentController.getPaymentByID);
apiRouter.post("/payment", paymentController.addNewPayment);
apiRouter.put("/payment/:id", paymentController.updatePayment);
apiRouter.delete("/payment/:id", paymentController.deletePayment);

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
apiRouter.delete("/discount/:discountId", discountController.deleteDiscount);
/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
