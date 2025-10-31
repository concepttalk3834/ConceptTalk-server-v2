import bcrypt from "bcrypt";
import { PoolClient } from "pg";
import { UserModel } from "../models/user-models";
import { generateToken, verifyToken } from "../utils/jwtUtils";
import { SchoolModel} from "../models/school-models";
import { DropperModel } from "../models/dropper-models";
import { CollegeModel } from "../models/college-models";
import { EmailService } from "./emailService";
export class AuthService {

  static async verifyEmail(client: PoolClient, token: string) {
  try {
    const payload = verifyToken(token); // your JWT verifier
    console.log("Token payload:", payload);
    const user = await UserModel.findById(client, payload.id);
    if (!user) throw { status: 404, message: "User not found" };
    if (user.is_verified) return { message: "Email already verified" };

    console.log("Verifying email for user ID:", user.id);
    await UserModel.markVerified(client, user.id);

    return { message: "Email verified successfully" };
  } catch (err) {
    throw { status: 400, message: "Invalid or expired token" };
  }
}


  static async signup(client: PoolClient, body: any) {
  const { email, password, confirmPassword } = body;

  if (!email || !password || !confirmPassword) {
    throw { status: 400, message: "Missing required fields" };
  }

  if (password !== confirmPassword) {
    throw { status: 400, message: "Passwords do not match" };
  }

  const existing = await UserModel.findByEmail(client, email);
  if (existing) {
    throw { status: 409, message: "Email already exists" };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    await client.query("BEGIN");

    const newUser = await UserModel.create(client, {
      email,
      password: hashedPassword,
      email_verified: false, // default
      // status: "pending",  // can be used to restrict dashboard access until verified
    });

    // Generate tokens
    const emailToken = generateToken({ id: newUser.id, email: newUser.email });

    // Store the token for verification
    await UserModel.insertOauthToken(client, newUser.id, '', emailToken);

    await client.query("COMMIT");

    // ✅ Send verification email
    await EmailService.sendVerificationEmail(email, emailToken);

    return {
      message: "User registered successfully. Please verify your email to continue.",
      userId: newUser.id,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

// Login service
  static async login(client: PoolClient, body: any) {
  const { email, password } = body;

  if (!email || !password) {
    throw { status: 400, message: "Missing email or password" };
  }

  const user = await UserModel.findByEmail(client, email);
  if (!user) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 401, message: "Invalid email or password" };
  }

  if (!user.email_verified) {
    throw { status: 403, message: "Please verify your email before logging in" };
  }

  // Generate access token
  const accessToken = generateToken({ id: user.id, email: user.email });

  return {
    message: "Login successful",
    accessToken,
    userId: user.id,
    email: user.email,
    role: user.role || null
  };
  }

}
