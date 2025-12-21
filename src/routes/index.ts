import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth";
import { dashboardRoutes } from "./dashboard";
import { notificationRoutes } from "./notificaitons";
import { adminRoutes } from "./admin";


export default async function registerRoutes(app: FastifyInstance) {
  // group all your route modules here
  app.register(authRoutes, { prefix: "/auth" });
  app.register(dashboardRoutes, { prefix: "/dashboard" });
  app.register(notificationRoutes, { prefix: "/notifications" });
  app.register(adminRoutes, { prefix: "/admin" });

  // you can add more in the future
  // app.register(userRoutes, { prefix: "/api/users" });
} 