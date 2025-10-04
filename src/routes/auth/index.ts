import { FastifyInstance } from "fastify";
import { AuthController } from "../../controllers/authController";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/signup", AuthController.signup);
}