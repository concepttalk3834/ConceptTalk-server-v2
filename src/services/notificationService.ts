// src/services/NotificationService.ts
import type { FastifyInstance } from 'fastify';
import { TemplateModel } from '../models/notification-template-model';
import { NotificationModel } from '../models/notification-model';

export class NotificationService {
  constructor(private app: FastifyInstance) {}

  private renderTemplate(templateStr: string, data?: Record<string, any>): string {
    if (!data) return templateStr;
    return templateStr.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
      return data[key] !== undefined ? String(data[key]) : '';
    });
  }

  async createFromTemplate(
    userId: number,
    templateCode: string,
    data?: Record<string, any>,
    link?: string
  ) {
    const client = await this.app.pg.pool.connect();
    try {
      const template = await TemplateModel.findByCode(client, templateCode);
      if (!template || !template.is_active) {
        throw new Error(`Template not found or inactive: ${templateCode}`);
      }

      if (template.channel !== 'WEB') {
        // For now we only create WEB notifications; email digests are separate
        this.app.log.warn({ templateCode }, 'Template channel is not WEB; still creating WEB notification');
      }

      const title = this.renderTemplate(template.title, data);
      const body = this.renderTemplate(template.body, data);

      const notification = await NotificationModel.create(client, {
        user_id: userId,
        template_id: template.id,
        title,
        body,
        link,
        data,
      });

      return notification;
    } finally {
      client.release();
    }
  }

  async listUserNotifications(userId: number, limit = 20) {
    const client = await this.app.pg.pool.connect();
    try {
      return await NotificationModel.listForUser(client, userId, limit);
    } finally {
      client.release();
    }
  }

  async markNotificationsRead(userId: number, ids: number[]) {
    const client = await this.app.pg.pool.connect();
    try {
      await NotificationModel.markRead(client, userId, ids);
    } finally {
      client.release();
    }
  }
}
