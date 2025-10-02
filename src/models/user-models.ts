import { PoolClient } from "pg";

export interface User {
  id?: number;
  full_name?: string;
  email: string;
  password: string;
  phone?: string;
  dob?: string;
  state?: string;
  role?: string;
  email_verified?: boolean;
}

export class UserModel {
  static async findByEmail(client: PoolClient, email: string) {
    const { rows } = await client.query("SELECT * FROM user_details WHERE email=$1", [email]);
    return rows[0];
  }

  static async create(client: PoolClient, user: User) {
    const { rows } = await client.query(
      `INSERT INTO user_details (full_name, email, password, phone, dob, state, role, email_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,false)
       RETURNING id,email`,
      [user.full_name || "", user.email, user.password, user.phone || null, user.dob || null, user.state || null, user.role || "user"]
    );
    return rows[0];
  }
}
