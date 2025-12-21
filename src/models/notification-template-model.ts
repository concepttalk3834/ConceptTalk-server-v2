// src/models/TemplateModel.ts
import type { PoolClient } from 'pg';

export interface NotificationTemplate {
  id: number;
  code: string;
  channel: 'WEB' | 'EMAIL';
  kind: 'TRANSACTIONAL' | 'PROMOTIONAL' | 'SYSTEM';
  title: string;
  body: string;
  is_active: boolean;
}

export class TemplateModel {
  static async findByCode(client: PoolClient, code: string): Promise<NotificationTemplate | null> {
    const { rows } = await client.query(
      `SELECT id, code, channel, kind, title, body, is_active
       FROM notification_templates
       WHERE code = $1`,
      [code]
    );
    return rows[0] ?? null;
  }

  static async create(client: PoolClient, data: Omit<NotificationTemplate, 'id'>) {
    const { rows } = await client.query(
      `INSERT INTO notification_templates (code, channel, kind, title, body, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, code, channel, kind, title, body, is_active`,
      [data.code, data.channel, data.kind, data.title, data.body, data.is_active]
    );
    return rows[0];
  }

  static async list(client: PoolClient) {
    const { rows } = await client.query(
      `SELECT id, code, channel, kind, title, body, is_active
       FROM notification_templates
       ORDER BY created_at DESC`
    );
    return rows;
  }
}
