// src/controllers/TemplateController.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import { TemplateModel } from '../models/notification-template-model';

export class TemplateController {
  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const client = await request.server.pg.connect();
    try {
      const templates = await TemplateModel.list(client);
      return reply.send(templates);
    } finally {
      client.release();
    }
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const client = await request.server.pg.connect();
    try {
      const body = request.body as {
        code: string;
        channel: 'WEB' | 'EMAIL';
        kind: 'TRANSACTIONAL' | 'PROMOTIONAL' | 'SYSTEM';
        title: string;
        body: string;
        is_active?: boolean;
      };

      const template = await TemplateModel.create(client, {
        ...body,
        is_active: body.is_active ?? true,
      });
      return reply.code(201).send(template);
    } finally {
      client.release();
    }
  };
}
