import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "smartdustbin-jwt-secret-key-32-chars-long-min"
);

export const DEFAULT_ADMIN_USER = process.env.ADMIN_USER || "admin";
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export interface UserPayload {
  username: string;
  role: string;
}

export async function signAuthToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      username: String(payload.username || ""),
      role: String(payload.role || "user"),
    };
  } catch {
    return null;
  }
}
