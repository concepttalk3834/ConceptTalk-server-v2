import type { FastifyInstance } from 'fastify';
import { NotificationService } from '../../services/notificationService';
import { NotificationController } from '../../controllers/notificationController';
import { TemplateController } from '../../controllers/templateController';

export async function adminRoutes(fastify: FastifyInstance) {
  const notificationService = new NotificationService(fastify);
  const notificationController = new NotificationController(notificationService);
  const templateController = new TemplateController();

  
  fastify.get('/notification-templates', templateController.list);
  fastify.post('/notification-templates', templateController.create);
  fastify.get('/notifications', notificationController.list);
  fastify.post('/notifications/read', notificationController.markRead);
  
}
