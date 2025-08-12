"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const seedSupperAdmin_1 = require("./app/utils/seedSupperAdmin");
const env_1 = require("./app/config/env");
const redis_config_1 = require("./app/config/redis.config");
let server;
dotenv_1.default.config();
const startServer = async () => {
    try {
        await mongoose_1.default.connect(env_1.envVars.DB_URL);
        console.log("Connected to DB");
        server = app_1.default.listen(env_1.envVars.PORT, () => {
            console.log(`Server is listening on PORT ${env_1.envVars.PORT}`);
        });
    }
    catch (error) {
        console.error(error);
    }
};
(async () => {
    await (0, redis_config_1.redisConnect)();
    await startServer();
    await (0, seedSupperAdmin_1.seedSupperAdmin)();
})();
process.on("SIGTERM", () => {
    console.log("SIGTERM signal recieved....server shutting down..");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("SIGINT", () => {
    console.log("SIGINT signal recieved....server shutting down..");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection Detected....server shutting down..", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception Detected....server shutting down..", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
// unhandled rejection error
// Promise.reject(new Error("I forgot to catch this promise"));
// uncaught exception error
// throw new Error("I forgot to handle this local error");
