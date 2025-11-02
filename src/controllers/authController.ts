import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/authService";

export class AuthController {
  static async signup(request: FastifyRequest, reply: FastifyReply) {
    const client = await request.server.pg.connect();
    try {
      const response = await AuthService.signup(client, request.body);
      return reply.status(201).send(response);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(err.status || 500).send({ error: err.message || "Internal Server Error" });
    } finally {
      client.release();
    }
  }
  static async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    const client = await request.server.pg.connect();
    const { token } = request.query as { token: string };
    try {
      const response = await AuthService.verifyEmail(client, token);
      return reply.status(200).send(response);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(err.status || 500).send({ error: err.message || "Internal Server Error" });
    } finally {
      client.release();
    }
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    const client = await request.server.pg.connect();
    try {
      const response = await AuthService.login(client, request.body);
      return reply.status(200).send(response);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(err.status || 500).send({ error: err.message || "Internal Server Error" });
    } finally {
      client.release();
    }
  }

  static async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    const client = await request.server.pg.connect();
    try {
      const response = await AuthService.forgotPassword(client, request.body);
      return reply.status(200).send(response);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(err.status || 500).send({ error: err.message || "Internal Server Error" });
    } finally {
      client.release();
    }
  }

  static async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const client = await request.server.pg.connect();
    try {
      const userId = (request.user as any).id;
      const response = await AuthService.changePassword(client, userId, request.body);
      return reply.status(200).send(response);
    } catch (err: any) {
      request.log.error(err);
      return reply.status(err.status || 500).send({ error: err.message || "Internal Server Error" });
    } finally {
      client.release();
    }
  }
}
