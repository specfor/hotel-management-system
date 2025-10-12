import { Router } from "express";

import { getUsers } from "@src/controllers/userController";
import * as branchController from "@src/controllers/branchController";

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

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
