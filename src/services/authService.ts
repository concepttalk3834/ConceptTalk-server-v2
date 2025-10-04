import bcrypt from "bcrypt";
import { PoolClient } from "pg";
import { UserModel } from "../models/user-models";
import { generateToken } from "../utils/jwtUtils";
import { SchoolModel} from "../models/school-models";
import { DropperModel } from "../models/dropper-models";
import { CollegeModel } from "../models/college-models";
export class AuthService {
  static async signup(client: PoolClient, body: any) {
    const { full_name, email, password, confirmPassword, phone, dob, state, role, extraFields } = body;

    if (!email || !password || !confirmPassword) throw { status: 400, message: "Missing required fields" };
    if (password !== confirmPassword) throw { status: 400, message: "Passwords do not match" };

    const existing = await UserModel.findByEmail(client, email);
    if (existing) throw { status: 409, message: "Email already exists" };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      await client.query("BEGIN");

      const newUser = await UserModel.create(client, {
        full_name, email, password: hashedPassword, phone, dob, state, role
      });

      const accessToken = generateToken({ id: newUser.id, email: newUser.email });
      const emailToken = generateToken({ id: newUser.id, email: newUser.email });

      await UserModel.insertOauthToken(client, newUser.id, accessToken, emailToken);

      switch (role) {
        case "school":
          await SchoolModel.create(client, newUser.id, role, extraFields);
          break;
        case "dropper":
          await DropperModel.create(client, newUser.id, role, extraFields);
          break;
        case "college":
          await CollegeModel.create(client, newUser.id, role, extraFields);
          break;
        case "admin":
          break;
      }

      await client.query("COMMIT");

      return {
        message: "User registered successfully. Please verify your email.",
        userId: newUser.id,
        verificationToken: emailToken,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  }

}
