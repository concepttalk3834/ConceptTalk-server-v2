import bcrypt from "bcrypt";
import { PoolClient } from "pg";
import { UserModel } from "../models/user-models";
import { generateToken } from "../utils/jwtUtils";

export class AuthService {
  static async signup(client: PoolClient, body: any) {
    const { email, password, confirmPassword, full_name, phone, dob, state, role } = body;

    // Validation
    if (!email || !password || !confirmPassword) {
      throw { status: 400, message: "Missing required fields" };
    }
    if (password !== confirmPassword) {
      throw { status: 400, message: "Passwords do not match" };
    }

    // Check if email exists
    const existing = await UserModel.findByEmail(client, email);
    if (existing) {
      throw { status: 409, message: "Email already exists" };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = await UserModel.create(client, {
      full_name,
      email,
      password: hashedPassword,
      phone,
      dob,
      state,
      role
    });

    // Create JWT
    const verificationToken = generateToken({
      id: newUser.id,
      email: newUser.email,
      password: hashedPassword
    });

    return {
      message: "User registered successfully. Please verify your email.",
      userId: newUser.id,
      verificationToken
    };
  }
}
