import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";
import { dashboardRoutes } from "./dashboard";


export default async function registerRoutes(app: FastifyInstance) {
  // group all your route modules here
  app.register(authRoutes, { prefix: "/auth" });
  app.register(dashboardRoutes, { prefix: "/dashboard" });

  // you can add more in the future
  // app.register(userRoutes, { prefix: "/api/users" });
} 