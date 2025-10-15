import { Router } from "express";

import {
  getUsers,
  getUserByStaffId,
  getUserByUsername,
  deleteUserByStaffId,
} from "@src/controllers/userController";
import { register, login } from "@src/controllers/authController";
import { authenticate } from "@src/common/middleware/authMiddleware";

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// Auth Routes (Public)

apiRouter.post("/auth/register", register);
apiRouter.post("/auth/login", login);

// User Routes (Protected - requires authentication)

apiRouter.get("/users", authenticate, getUsers);
apiRouter.get("/users/staff/:staffId", authenticate, getUserByStaffId);
apiRouter.get("/users/username/:username", authenticate, getUserByUsername);
apiRouter.delete("/users/:staffId", authenticate, deleteUserByStaffId);

apiRouter.use("/api", apiRouter);
/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
