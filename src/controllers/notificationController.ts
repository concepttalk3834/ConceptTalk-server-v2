// src/controllers/NotificationController.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
  constructor(private svc: NotificationService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.id; // adapt to your auth
    const { limit = 20 } = request.query as { limit?: number };
    const notifications = await this.svc.listUserNotifications(userId, limit);
    return reply.send(notifications);
  };

  markRead = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as any).user.id;
    const { ids } = request.body as { ids: number[] };
    await this.svc.markNotificationsRead(userId, ids);
    return reply.send({ success: true });
  };
}
