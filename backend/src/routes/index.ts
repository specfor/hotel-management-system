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

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
