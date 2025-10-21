import { Request, Response } from "express";
import { jsonResponse } from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import {
  getAllRoomsDB,
  getRoomsByBranchDB,
  createRoomDB,
  updateRoomDB,
  deleteRoomDB,
  getBranchIdOfRoom,
  getRoomByIdDB,
} from "@src/repos/roomRepo";
import { getBranchByIdDB } from "@src/repos/branchRepo";
import { getRoomTypeByNameDB } from "@src/repos/roomTypeRepo";
import * as console from "node:console";
import Joi from "joi";

export async function getAllRooms(req: Request, res: Response) {
  try {
    const roomArr = await getAllRoomsDB();

    return jsonResponse(res, true, HttpStatusCodes.OK, { roomArr });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function getRoomsByBranch(req: Request, res: Response) {
  try {
    const paramSchema = Joi.object<{ branchId: number }>({
      branchId: Joi.number().integer().positive().required(),
    });

    const paramResult = paramSchema.validate(req.params, {
      abortEarly: false,
    });

    if (paramResult.error) {
      const messages = paramResult.error.details.map((d) => d.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Invalid input data",
        details: messages,
      });
    }

    const branchId: number = paramResult.value.branchId;

    if ((await getBranchByIdDB(branchId)) == null) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Invalid branch ID",
      });
    }

    const querySchema = Joi.object<{ type?: string; status?: string }>({
      type: Joi.string().valid("Single", "Double", "Suite").insensitive().optional(),
      status: Joi.string().valid("Occupied", "Available").insensitive().optional(),
    });

    const queryResult = querySchema.validate(req.query, {
      abortEarly: false,
    });

    if (queryResult.error) {
      const messages = queryResult.error.details.map((d) => d.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Invalid query parameters",
        details: messages,
      });
    }

    const { type, status } = queryResult.value;

    const rooms = await getRoomsByBranchDB(branchId, type, status);

    if (!rooms || rooms.length === 0) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "No rooms found for the given branch",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Rooms fetched successfully",
      details: rooms,
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function createRoom(req: Request, res: Response) {
  try {
    const paramSchema = Joi.object<{ branchId: number }>({
      branchId: Joi.number().integer().positive().required(),
    });

    const paramResult = paramSchema.validate(req.params, {
      abortEarly: false,
    });

    if (paramResult.error) {
      const messages = paramResult.error.details.map((d) => d.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Invalid input data",
        details: messages,
      });
    }

    const branchId = paramResult.value.branchId;

    const querySchema = Joi.object<{ roomType: string }>({
      roomType: Joi.string().valid("Single", "Double", "Suite").trim().insensitive().required(),
    });

    const queryResult = querySchema.validate(req.query, {
      abortEarly: false,
    });

    if (queryResult.error) {
      const messages = queryResult.error.details.map((d) => d.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Invalid query parameter(s)",
        details: messages,
      });
    }

    const roomTypeName = queryResult.value.roomType;

    const branch = await getBranchByIdDB(branchId);
    if (!branch) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: `Branch with ID ${branchId} not found`,
      });
    }

    const roomType = await getRoomTypeByNameDB(branchId, roomTypeName);

    if (!roomType) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: `Room type '${roomTypeName}' not found in branch ${branchId}`,
      });
    }

    const createdRoom = await createRoomDB(branchId, roomType.typeID);

    if (!createdRoom) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Room creation failed",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Room created successfully",
      details: createdRoom,
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function updateRoom(req: Request, res: Response) {
  try {
    const paramSchema = Joi.object<{ roomId: number }>({
      roomId: Joi.number().integer().positive().required(),
    });

    const paramResult = paramSchema.validate(req.params, {
      abortEarly: false,
    });

    if (paramResult.error) {
      const messages = paramResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const roomId: number = paramResult.value.roomId;

    if ((await getRoomByIdDB(roomId)) == null) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Invalid room ID",
      });
    }

    const bodySchema = Joi.object<{ roomStatus?: string; roomTypeName?: string }>({
      roomStatus: Joi.string().valid("Occupied", "Available").insensitive().optional(),
      roomTypeName: Joi.string().valid("Single", "Double", "Suite").insensitive().trim().optional(),
    });

    const bodyResult = bodySchema.validate(req.body, {
      abortEarly: false,
    });

    if (bodyResult.error) {
      const messages = bodyResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const roomStatus = bodyResult.value.roomStatus;
    const roomTypeName = bodyResult.value.roomTypeName;

    if (!roomStatus && !roomTypeName) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "At least one field should be not null",
      });
    }

    let typeId: number | undefined;

    if (roomTypeName) {
      const branchObj = await getBranchIdOfRoom(roomId);

      if (!branchObj) {
        return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
          message: `Branch not found for room ID ${roomId}`,
        });
      }

      const roomType = await getRoomTypeByNameDB(branchObj.branchId, roomTypeName);

      if (!roomType) {
        return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
          message: `Room type '${roomTypeName}' not found in branch ` + `${branchObj.branchId}`,
        });
      }

      typeId = roomType.typeID;
    }

    const updatedRoom = await updateRoomDB(roomId, typeId, roomStatus);

    if (!updatedRoom) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Room updating unsuccessful",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Room updated successfully",
      details: updatedRoom,
    });
  } catch (err) {
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}

export async function deleteRoom(req: Request, res: Response) {
  try {
    const paramSchema = Joi.object<{ roomId: number }>({
      roomId: Joi.number().integer().positive().required(),
    });

    const paramResult = paramSchema.validate(req.params, {
      abortEarly: false,
    });

    if (paramResult.error) {
      const messages = paramResult.error.details.map((details) => details.message);
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "invalid input data",
        details: messages,
      });
    }

    const roomId = paramResult.value.roomId;

    const deleted = await deleteRoomDB(roomId);

    if (!deleted) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {
        message: "Room deletion unsuccessful",
      });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, {
      message: "Room with ID " + roomId + " deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {
      message: "Server error",
    });
  }
}
