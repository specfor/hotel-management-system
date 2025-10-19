import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ENV from "@src/common/constants/ENV";

//JWT Payload structure
export interface JwtPayload {
  staffId: number;
  username: string;
}

//Hash a plain text password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

//Compare a plain text password with a hashed password
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

//Generate a JWT token
export function generateToken(payload: JwtPayload): string {
  if (!ENV.Jwt.Secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const secret = ENV.Jwt.Secret;
  const expiresIn = ENV.Jwt.Exp || "1d";
  // @ts-expect-error - jwt.sign type issue with jet-env string type
  return jwt.sign(payload, secret, { expiresIn });
}

//Verify and decode a JWT token
export function verifyToken(token: string): JwtPayload {
  if (!ENV.Jwt.Secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const secret = ENV.Jwt.Secret;
  return jwt.verify(token, secret) as JwtPayload;
}
