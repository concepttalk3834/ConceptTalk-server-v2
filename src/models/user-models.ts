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
    const res = await client.query(
      `SELECT * FROM user_details WHERE email = $1`,
      [email]
    );
    return res.rows[0] || null;
  }

  static async create(client: PoolClient, user: any) {
    const res = await client.query(
      `INSERT INTO user_details 
        (full_name, email, password, phone, dob, state, role, email_verified, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,FALSE,NOW(),NOW())
       RETURNING id, email, role`,
      [user.full_name, user.email, user.password, user.phone, user.dob, user.state, user.role]
    );
    return res.rows[0];
  }

  static async insertOauthToken(client: PoolClient, customer_id: string, accessToken: string, emailToken: string) {
    await client.query(
      `INSERT INTO oauth_tokens 
        (customer_id, access_token, email_token, refresh_token, expires_at, created_at, updated_at)
       VALUES ($1,$2,$3,NULL,NOW() + INTERVAL '1 hour',NOW(),NOW())`,
      [customer_id, accessToken, emailToken]
    );
  }
}
