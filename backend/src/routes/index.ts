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
apiRouter.get("/guests", getAllGuests);
// Get guest by ID
apiRouter.get("/guests/:id", getGuestByID);
// Add new guest
apiRouter.post("/guests", addNewGuest);
// Update guest info
apiRouter.put("/guests/:id", updateGuestInfo);
// Change password
apiRouter.put("/guests/:id/psw", changeGuestPassword);
// Delete guest
apiRouter.delete("/guests/:id", deleteGuest);

// apiRouter.use("/api", apiRouter);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
