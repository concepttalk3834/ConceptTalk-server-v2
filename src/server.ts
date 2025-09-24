import Fastify from "fastify";
import dotenv from "dotenv";
import {pool} from './config/db'
dotenv.config();

const server = Fastify({
    logger: true,
})

server.get("/home",async (request,reply)=>{
    try {
        const result = await pool.query("SELECT NOW()");
        reply.send({message:"home page",time:result.rows[0]});
    } catch (error:any) {
        reply.send(500).send({error:"Database Error",details:error.messgae})
    }
})

const start = async()=>{
    try {
       await server.listen({ port: parseInt(process.env.PORT || "8000", 10) });
        console.log(`Server running on http://localhost:${process.env.PORT}`);
    } catch (error) {
        console.log(`Error connecting to the server: ${error}`);
    }
}

start();