import { PoolClient } from "pg";

export class DropperModel {
  static async create(client: PoolClient, customer_id: string, role: string, extraFields: any) {
    await client.query(
      `INSERT INTO dropper_users
        (customer_id, role, category, percentile, user_rank, exams_given, counselling_guidance_for, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())`,
      [
        customer_id,
        role,
        extraFields.category,
        extraFields.percentile,
        extraFields.user_rank,
        extraFields.exam_given,
        extraFields.counselling_guidance_for
      ]
    );
  }
}
