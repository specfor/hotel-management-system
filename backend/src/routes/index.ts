 
import { Router } from "express";
import { getUsers } from "@src/controllers/userController";
import * as branchController from "@src/controllers/branchController";
import * as roomTypeController from "@src/controllers/roomTypeController";
import * as roomController from "@src/controllers/roomController";
import * as discountController from "@src/controllers/discountController";
import {getDiscountById} from "@src/controllers/discountController";

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

// endpoints for room
apiRouter.get("/room", roomController.getAllRooms);
apiRouter.get("/branch/:branchID/room", roomController.getRoomsByBranch);
apiRouter.post("/branch/:branchID/room", roomController.createRoom);
apiRouter.put("/room/:roomID", roomController.updateRoom);
apiRouter.delete("/room/:roomID", roomController.deleteRoom);

// endpoints for discounts
apiRouter.get("/discount", discountController.getAllDiscounts);
apiRouter.get("/discount/:discountID", discountController.getDiscountById);
apiRouter.get("/discount/branch/:branchID", discountController.getDiscountsByBranch);
apiRouter.post("/discount", discountController.createDiscount);
apiRouter.put("/discount/:discountID", discountController.updateDiscount);
apiRouter.delete("/discount/:discountID", discountController.deleteDiscount);
/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
