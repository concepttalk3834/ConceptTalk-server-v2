// src/services/EmailDigestService.ts
import type { FastifyInstance } from 'fastify';
import { NotificationModel } from '../models/notification-model';

export class EmailDigestService {
  constructor(private app: FastifyInstance) {}

  private async getUserEmail(client: any, userId: number): Promise<string | null> {
    const { rows } = await client.query(
      `SELECT email, notify_via_email
       FROM users
       WHERE id = $1`,
      [userId]
    );
    if (!rows[0] || !rows[0].notify_via_email) return null;
    return rows[0].email;
  }

  async processDigestBatch(limitUsers = 100, perUserNotifLimit = 50) {
    const pool = this.app.pg.pool;
    const client = await pool.connect();
    try {
      const userRows = await NotificationModel.findUsersWithUnreadUnemailed(client, limitUsers);

      for (const { user_id } of userRows) {
        const email = await this.getUserEmail(client, user_id);
        if (!email) continue;

        const notifs = await NotificationModel.findUnreadUnemailedForUser(
          client,
          user_id,
          perUserNotifLimit
        );
        if (!notifs.length) continue;

        await this.sendDigestEmail(email, notifs);

        await NotificationModel.markEmailed(client, notifs.map(n => n.id));
      }
    } finally {
      client.release();
    }
  }

  private async sendDigestEmail(
    to: string,
    notifications: { title: string; body?: string | null; link?: string | null; created_at: string }[]
  ) {
    const subject = `You have ${notifications.length} new notification(s)`;

    const htmlList = notifications
      .map(
        n => `<li><strong>${n.title}</strong>${n.body ? ' - ' + n.body : ''}</li>`
      )
      .join('');

    const html = `
      <p>You have new notifications:</p>
      <ul>${htmlList}</ul>
      <p><a href="https://yourapp.com/notifications">View all</a></p>
    `;

    // TODO: plug in your email provider here
    this.app.log.info({ to, count: notifications.length }, 'Sending digest email');
    // await emailClient.send({ to, subject, html });
  }
}
