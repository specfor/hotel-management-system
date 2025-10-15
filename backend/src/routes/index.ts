import { Router } from "express";

import { getUsers } from "@src/controllers/userController";
import { register, login } from "@src/controllers/authController";
import { authenticate } from "@src/common/middleware/authMiddleware";

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// Auth routes (public)
apiRouter.post("/auth/register", register);
apiRouter.post("/auth/login", login);

// User routes (protected)
apiRouter.get("/users", authenticate, getUsers);

apiRouter.use("/api", apiRouter);


/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
