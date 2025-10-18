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

  static async create(
    client: PoolClient,
    {
      email,
      password,
      email_verified = false,

    }: { email: string; password: string; email_verified?: boolean }
  ) {
        const query = `
        INSERT INTO user_details (email, password, email_verified, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id, email, email_verified;
      `;

      const values = [email, password, email_verified];
      const res = await client.query(query, values);

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

  static async findById(client: any, id:any) {
    const res = await client.query(
      `SELECT * FROM user_details WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }
  
  static async markVerified(client: any , userId:any ) {
    const query = `
      UPDATE user_details
      SET email_verified = TRUE,
          verified_at = NOW()
      WHERE id = $1
      RETURNING id, email, email_verified, verified_at;
    `;
    const { rows } = await client.query(query, [userId]);
    return rows[0] || null;
  }

    static async updateProfile(
      client: any,
      userId: any,
      {
        full_name,
        phone,
        dob,
        state,
        role,
      }: { full_name?: string; phone?: string; dob?: string; state?: string; role?: string }
    ) {
    const query = `
      UPDATE users
      SET 
        full_name = $1,
        phone = $2,
        dob = $3,
        state = $4,
        role = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING id, email, full_name, phone, dob, state, role, is_verified, status, updated_at;
    `;

    const values = [full_name, phone, dob, state, role, userId];
    const { rows } = await client.query(query, values);

    return rows[0] || null;
  }
}
