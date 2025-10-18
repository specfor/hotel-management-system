import { Router } from "express";

import {
  getUsers,
  getUserByStaffId,
  getUserByUsername,
  deleteUserByStaffId,
} from "@src/controllers/userController";
import { register, login } from "@src/controllers/authController";
import {
  getStaffMembers,
  getStaffById,
  getStaffByBranchId,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
} from "@src/controllers/staffController";
import {
  getRevenueRecords,
  getRevenueById,
  getRevenueByBranchId,
  getRevenueByMonthNumber,
  createRevenueRecord,
  updateRevenueRecord,
  deleteRevenueRecord,
} from "@src/controllers/revenueController";

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// Auth Routes (Public)

apiRouter.post("/auth/register", register);
apiRouter.post("/auth/login", login);

// User Routes (Protected by global auth middleware)

apiRouter.get("/users", getUsers);
apiRouter.get("/users/staff/:staffId", getUserByStaffId);
apiRouter.get("/users/username/:username", getUserByUsername);
apiRouter.delete("/users/:staffId", deleteUserByStaffId);

// Staff Routes (Protected by global auth middleware)

apiRouter.get("/staff", getStaffMembers);
apiRouter.get("/staff/:staffId", getStaffById);
apiRouter.get("/staff/branch/:branchId", getStaffByBranchId);
apiRouter.post("/staff", createStaffMember);
apiRouter.put("/staff/:staffId", updateStaffMember);
apiRouter.delete("/staff/:staffId", deleteStaffMember);

// Revenue Routes (Protected by global auth middleware)

apiRouter.get("/revenue", getRevenueRecords);
apiRouter.get("/revenue/:recordId", getRevenueById);
apiRouter.get("/revenue/branch/:branchId", getRevenueByBranchId);
apiRouter.get("/revenue/month/:month", getRevenueByMonthNumber);
apiRouter.post("/revenue", createRevenueRecord);
apiRouter.put("/revenue/:recordId", updateRevenueRecord);
apiRouter.delete("/revenue/:recordId", deleteRevenueRecord);

apiRouter.use("/api", apiRouter);
/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
