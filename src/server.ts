import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import dotenv from 'dotenv';


let server: Server;
const PORT = 5000;
dotenv.config();

const startServer = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uv360.mongodb.net/tour-db?retryWrites=true&w=majority&appName=Cluster0`);
        console.log("Connected to DB");

        server = app.listen(PORT, () => {
            console.log(`Server is listening on PORT ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
};

startServer();


