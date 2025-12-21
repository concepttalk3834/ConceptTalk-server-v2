// src/models/NotificationModel.ts
import type { PoolClient } from 'pg';

export interface Notification {
  id: number;
  user_id: number;
  template_id?: number | null;
  title: string;
  body?: string | null;
  link?: string | null;
  status: 'UNREAD' | 'READ';
  data?: any;
  emailed_at?: string | null;
  created_at: string;
}

export class NotificationModel {
  static async create(
    client: PoolClient,
    input: {
      user_id: number;
      template_id?: number | null;
      title: string;
      body?: string | null;
      link?: string | null;
      data?: any;
    }
  ): Promise<Notification> {
    const { rows } = await client.query(
      `INSERT INTO notifications (user_id, template_id, title, body, link, data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.user_id,
        input.template_id ?? null,
        input.title,
        input.body ?? null,
        input.link ?? null,
        input.data ?? null,
      ]
    );
    return rows[0];
  }

  static async listForUser(
    client: PoolClient,
    userId: number,
    limit: number
  ): Promise<Notification[]> {
    const { rows } = await client.query(
      `SELECT id, user_id, template_id, title, body, link, status, data, emailed_at, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  static async markRead(
    client: PoolClient,
    userId: number,
    ids: number[]
  ): Promise<void> {
    await client.query(
      `UPDATE notifications
       SET status = 'READ'
       WHERE user_id = $1 AND id = ANY($2::bigint[])`,
      [userId, ids]
    );
  }

  static async findUnreadUnemailedForUser(
    client: PoolClient,
    userId: number,
    limit: number
  ): Promise<Notification[]> {
    const { rows } = await client.query(
      `SELECT id, user_id, title, body, link, created_at
       FROM notifications
       WHERE user_id = $1
         AND status = 'UNREAD'
         AND emailed_at IS NULL
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  static async markEmailed(client: PoolClient, ids: number[]): Promise<void> {
    await client.query(
      `UPDATE notifications
       SET emailed_at = NOW()
       WHERE id = ANY($1::bigint[])`,
      [ids]
    );
  }

  static async findUsersWithUnreadUnemailed(
    client: PoolClient,
    limit: number
  ): Promise<{ user_id: number }[]> {
    const { rows } = await client.query(
      `SELECT DISTINCT user_id
       FROM notifications
       WHERE status = 'UNREAD'
         AND emailed_at IS NULL
       LIMIT $1`,
      [limit]
    );
    return rows;
  }
}
