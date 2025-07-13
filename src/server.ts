/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import dotenv from 'dotenv';


let server: Server;
const PORT = 5000;
dotenv.config();

const startServer = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uv360.mongodb.net/tour-management-backend?retryWrites=true&w=majority&appName=Cluster0`);
        console.log("Connected to DB");

        server = app.listen(PORT, () => {
            console.log(`Server is listening on PORT ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
};

startServer();

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