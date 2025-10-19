import { Router } from "express";

import { getUsers } from "@src/controllers/userController";
import { getAllGuests, getGuestByID, addNewGuest, updateGuestInfo, changeGuestPassword, deleteGuest} from "@src/controllers/guestController";

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// Get all users
apiRouter.get("/users", getUsers);

// Get all guests
apiRouter.get("/guest", getAllGuests);
// Get guest by ID
apiRouter.get("/guest/:id", getGuestByID);
// Add new guest
apiRouter.post("/guest", addNewGuest);
// Update guest info
apiRouter.put("/guest/:id", updateGuestInfo);
// Change password
apiRouter.put("/guest/:id/psw", changeGuestPassword);
// Delete guest
apiRouter.delete("/guest/:id", deleteGuest);

// apiRouter.use("/api", apiRouter);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
