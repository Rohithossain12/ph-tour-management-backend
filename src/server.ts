/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import dotenv from 'dotenv';
import { seedSupperAdmin } from "./app/utils/seedSupperAdmin";
import { envVars } from "./app/config/env";
import { redisConnect } from "./app/config/redis.config";


let server: Server;
dotenv.config();

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL);
        console.log("Connected to DB");

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is listening on PORT ${envVars.PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
};
(
    async () => {
        await redisConnect()
        await startServer()
        await seedSupperAdmin()
    })()

process.on("SIGTERM", () => {
    console.log("SIGTERM signal recieved....server shutting down..");

    if (server) {
        server.close(() => {
            process.exit(1)
        });

    }
    process.exit(1)
});
process.on("SIGINT", () => {
    console.log("SIGINT signal recieved....server shutting down..");

    if (server) {
        server.close(() => {
            process.exit(1)
        });

    }
    process.exit(1)
});


process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection Detected....server shutting down..", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        });

    }
    process.exit(1)
});


process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception Detected....server shutting down..", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        });

    }
    process.exit(1)
});

// unhandled rejection error
// Promise.reject(new Error("I forgot to catch this promise"));
// uncaught exception error
// throw new Error("I forgot to handle this local error");