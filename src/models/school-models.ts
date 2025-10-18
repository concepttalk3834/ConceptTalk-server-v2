import { PoolClient } from "pg";

export class SchoolModel {
  static async create(client: PoolClient, customer_id: string, role: string, extraFields: any) {
    await client.query(
      `INSERT INTO school_users 
        (customer_id, role, category, percentile, user_rank, exam_preparing_for, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
      [customer_id, role, extraFields.category, extraFields.percentile, extraFields.user_rank, extraFields.exam_preparing_for]
    );
  }

  static async findByUserId(client: PoolClient, customer_id: string) {
    const res = await client.query(
      `SELECT * FROM school_users WHERE customer_id = $1`,
      [customer_id]
    );
    return res.rows[0] || null;
  }
}
