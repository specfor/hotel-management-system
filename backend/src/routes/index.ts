import { Router } from "express";

import { getUsers } from "@src/controllers/userController";
import { getGuests } from "@src/controllers/guestController";

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// Get all users
apiRouter.get("/users", getUsers);

// Get all guests
apiRouter.get("/guests", getGuests);

apiRouter.use("/api", apiRouter);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
