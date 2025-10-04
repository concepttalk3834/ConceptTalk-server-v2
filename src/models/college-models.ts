import { PoolClient } from "pg";


export class CollegeModel {
  static async create(client: PoolClient, customer_id: string, role: string, extraFields: any) {
    await client.query(
      `INSERT INTO college_users
        (customer_id, role, college_year, branch, college_name, targeted_job, main_concern_for_mentorship, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())`,
      [
        customer_id,
        role,
        extraFields.college_year,
        extraFields.branch,
        extraFields.college_name,
        extraFields.targeted_job,
        extraFields.main_concern_for_mentorship
      ]
    );
  }
}
