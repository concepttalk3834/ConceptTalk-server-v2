import { FastifyReply, FastifyRequest } from "fastify";
import { UserModel } from "../models/user-models";
import { SchoolModel } from "../models/school-models";
import { DropperModel } from "../models/dropper-models";
import { CollegeModel } from "../models/college-models";


export class DashboardController {

static async addDashboardDetails(client: any, userId: string, body: any) {
  const { full_name, phone, dob, state, role, extraFields } = body;

  // 1️⃣ Basic validation
  if (!role) throw { status: 400, message: "Role is required" };

  // 2️⃣ Fetch user
  const user = await UserModel.findById(client, userId);
  if (!user) throw { status: 404, message: "User not found" };
  if (!user.is_verified)
    throw { status: 403, message: "Please verify your email before adding dashboard details" };

  try {
    await client.query("BEGIN");

    // 3️⃣ Update base user details
    await UserModel.updateProfile(client, userId, {
      full_name,
      phone,
      dob,
      state,
      role,
    });

    // 4️⃣ Role-specific table inserts
    switch (role) {
      case "school":
        await SchoolModel.create(client, userId, role, extraFields);
        break;

      case "dropper":
        await DropperModel.create(client, userId, role, extraFields);
        break;

      case "college":
        await CollegeModel.create(client, userId, role, extraFields);
        break;

      case "admin":
        // No extra role details needed
        break;

      default:
        throw { status: 400, message: `Unknown role: ${role}` };
    }

    await client.query("COMMIT");

    return {
      message: "Dashboard details added successfully",
      userId,
      role,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

static async getDashboardInfo(client: any, userId: string) {
    // 1️⃣ Fetch user
    const user = await UserModel.findById(client, userId);
    if (!user) throw { status: 404, message: "User not found" };
    if (!user.is_verified)
        throw { status: 403, message: "Please verify your email before accessing dashboard info" };
    // 2️⃣ Base user info
    const dashboardInfo: any = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        state: user.state,
        role: user.role,
    };
    
    // 3️⃣ Role-specific info
    switch (user.role) {
        case "school":
            const schoolDetails = await SchoolModel.findByUserId(client, userId);
            dashboardInfo.roleDetails = schoolDetails;
            break;
        case "dropper":
            const dropperDetails = await DropperModel.findByUserId(client, userId);
            dashboardInfo.roleDetails = dropperDetails;
            break;
        case "college":
            const collegeDetails = await CollegeModel.findByUserId(client, userId);
            dashboardInfo.roleDetails = collegeDetails;
            break;
        case "admin":
            dashboardInfo.roleDetails = { message: "Admin has no additional details" };
            break;
        default:
            throw { status: 400, message: `Unknown role: ${user.role}` };
    }

    return dashboardInfo;

    }
}
