/* eslint-disable max-len */
import { Request, Response } from "express";
import {jsonResponse} from "@src/common/util/response";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import {
  getAllRoomsDB,
  getRoomsByBranchDB,
  createRoomDB,
  updateRoomDB,
  deleteRoomDB,
  getBranchIdOfRoom,
} from "@src/repos/roomRepo";
import {getBranchByIdDB} from "@src/repos/branchRepo";
import {getRoomTypeByNameDB} from "@src/repos/roomTypeRepo";

export async function getAllRooms(req:Request, res: Response):Promise<void>{
  try{
    const roomArr = await getAllRoomsDB();
    if(!roomArr){
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, {message: "No rooms exist or query execution failed"});
    }else{
      return jsonResponse(res, true, HttpStatusCodes.OK, {roomArr});
    }
  }catch(err){
    console.log(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, {message: "Server error"});
  }
}

export async function getRoomsByBranch(req: Request, res: Response): Promise<void> {
  try {
    const branchID = parseInt(req.params.branchID, 10);
    const { type, status } = req.query; // type and status are optional

    if (isNaN(branchID)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Branch ID is not a number" });
    }

    const rooms = await getRoomsByBranchDB(branchID, type, status);

    if (!rooms) {
      return jsonResponse(res, true, HttpStatusCodes.BAD_REQUEST, { message: "No rooms found" });
    }else{
      return jsonResponse(res, true, HttpStatusCodes.OK, { rooms });
    }

  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
  }
}

export async function createRoom(req: Request, res: Response):Promise<void>{

  try{
    const branchIdInt = parseInt(req.params.branchID, 10);
    const roomTypeName = req.query.roomType;

    if (isNaN(branchIdInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Branch ID is not a number" });
    }

    const branch = await getBranchByIdDB(branchIdInt);
    if (!branch) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Branch not found" });
    }

    if (!roomTypeName) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Room type name is required" });
    }

    const roomTypeId = await getRoomTypeByNameDB(branchIdInt, roomTypeName as string);

    if (!roomTypeId) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: `Room type '${roomTypeName}' not found in branch ${branchIdInt}` });
    }

    const createdRoom = await createRoomDB(branchIdInt, roomTypeId.typeID);

    if (!createdRoom) {
      return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Room creation failed" });
    }else{
      return jsonResponse(res, true, HttpStatusCodes.OK, {createdRoom});
    }

  }catch(err){
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
  }

}

export async function updateRoom(req: Request, res: Response): Promise<void> {
  try {
    const roomIDInt = parseInt(req.params.roomID, 10);
    const { roomStatus, roomTypeName } = req.body;

    console.log(roomStatus, roomTypeName);

    if (isNaN(roomIDInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Room ID is not a number" });
    }

    if (!roomStatus && !roomTypeName) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "At least one field (status or type) must be provided" });
    }

    let typeID: number | undefined;
    if (roomTypeName) {
      const branchIdObj = await getBranchIdOfRoom(roomIDInt);
      const roomType = await getRoomTypeByNameDB(branchIdObj.branchID, roomTypeName);
      if (!roomType) {
        return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: `Room type '${roomTypeName}' not found` });
      }
      typeID = roomType.typeID;
    }

    const updatedRoom = await updateRoomDB(roomIDInt, typeID, roomStatus);

    if (!updatedRoom) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Room not found or update failed" });
    }

    return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Room updated successfully", updatedRoom });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
  }
}

export async function deleteRoom(req: Request, res: Response): Promise<void> {
  try {
    const roomIDInt = parseInt(req.params.roomID, 10);

    if (isNaN(roomIDInt)) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Room ID is not a number" });
    }

    const deleted = await deleteRoomDB(roomIDInt);

    if (!deleted) {
      return jsonResponse(res, false, HttpStatusCodes.BAD_REQUEST, { message: "Room not found" });
    }else{
      return jsonResponse(res, true, HttpStatusCodes.OK, { message: "Room deleted successfully" });
    }

  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, HttpStatusCodes.INTERNAL_SERVER_ERROR, { message: "Server error" });
  }
}