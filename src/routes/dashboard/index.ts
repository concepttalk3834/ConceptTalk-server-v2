import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { DashboardController } from "../../controllers/dashboardController";

// Extend FastifyRequest to include 'user'
declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string;
            [key: string]: any;
        };
    }
}

 export async function dashboardRoutes(fastify: FastifyInstance) {
    fastify.post("/add-details", async (request: FastifyRequest, reply: FastifyReply) => {
        const client = await request.server.pg.connect();
        try {
            const userId = (request.user as any).id;
            const response = await DashboardController.addDashboardDetails(client, userId, request.body);
            return reply.status(200).send(response);
        } catch (err: any) {
            request.log.error(err);
            return reply.status(err.status || 500).send({ error: err.message || "Internal Server Error" });
        } finally {
            client.release();
        }
    });

    fastify.get("/get-dashboard-info", async (request: FastifyRequest, reply: FastifyReply) => {
        const client = await request.server.pg.connect();
        try {
            const userId = (request.user as any).id;
            const response = await DashboardController.getDashboardInfo(client, userId);
            return reply.status(200).send(response);
        } catch (err: any) {
            request.log.error(err);
            return reply.status(err.status || 500).send({ error: err.message || "Internal Server Error" });
        } finally {
            client.release();
        }
    });

}   