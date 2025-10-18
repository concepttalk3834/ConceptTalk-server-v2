import jwt from "jsonwebtoken";

export function generateToken(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET || "supersecretkey", {
    expiresIn: "1h"
  });
}

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

/**
 * Verifies a JWT token and returns the decoded payload.
 * Throws an error if the token is invalid or expired.
 *
 * @param {string} token - The JWT token to verify
 * @returns {object} - The decoded payload (e.g., { id, email })
 */
export function verifyToken(token: string): any {
  try {
    if (!token) {
      throw { status: 400, message: "Token is required" };
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    return decoded; // e.g., { id: "uuid", email: "user@example.com", iat, exp }
  } catch (err:any) {
    if (err.name === "TokenExpiredError") {
      throw { status: 401, message: "Token has expired" };
    }
    if (err.name === "JsonWebTokenError") {
      throw { status: 400, message: "Invalid token" };
    }

    throw { status: 500, message: "Token verification failed" };
  }
}

