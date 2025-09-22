import { Router } from "express";

import { getUsers } from "@src/controllers/userController";

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// Get all users
apiRouter.get("/users", getUsers);

apiRouter.use("/api", apiRouter);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
