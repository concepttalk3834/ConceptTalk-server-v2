import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";


export default async function registerRoutes(app: FastifyInstance) {
  // group all your route modules here
  app.register(authRoutes, { prefix: "/auth" });

  // you can add more in the future
  // app.register(userRoutes, { prefix: "/api/users" });
}