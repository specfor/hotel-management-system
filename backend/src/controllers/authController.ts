import { Request, Response } from "express";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import {
  findUserByUsername,
  createUser,
  findUserByStaffId,
} from "@src/repos/userRepo";
import {
  generateToken,
  hashPassword,
  comparePassword,
} from "@src/common/util/auth";
import { UserLogin, UserRegister } from "@src/types/userTypes";

//Register a new user (staff member)
//POST /api/auth/register

export async function register(req: Request, res: Response) {
  try {
    const { staff_id, username, password } = req.body as UserRegister;

    // Validate input
    if (!staff_id || !username || !password) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "staff_id, username, and password are required",
      });
    }

    // Check if username already exists
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "Username already exists",
      });
    }

    // Check if staff_id already has a user account
    const existingStaffUser = await findUserByStaffId(staff_id);
    if (existingStaffUser) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "This staff member already has a user account",
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await createUser(
      { staff_id, username, password },
      passwordHash,
    );

    // Generate token
    const token = generateToken({
      staffId: newUser.staff_id,
      username: newUser.username,
    });

    return res.status(HttpStatusCodes.OK).json({
      message: "User registered successfully",
      user: {
        staff_id: newUser.staff_id,
        username: newUser.username,
      },
      token,
    });
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to register user",
      details: String(error),
    });
  }
}

//Login user
//POST /api/auth/login

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body as UserLogin;

    // Validate input
    if (!username || !password) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "Username and password are required",
      });
    }

    // Find user
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "Invalid username or password",
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: "Invalid username or password",
      });
    }

    // Generate token
    const token = generateToken({
      staffId: user.staff_id,
      username: user.username,
    });

    return res.status(HttpStatusCodes.OK).json({
      message: "Login successful",
      user: {
        staff_id: user.staff_id,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Failed to login",
      details: String(error),
    });
  }
}
