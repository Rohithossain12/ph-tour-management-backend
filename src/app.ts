import express, { Request, Response } from "express";
import cors from "cors"
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import expressSession from "express-session"
import cookieParser from "cookie-parser";
import passport from "passport";
import "./app/config/passport";
import { envVars } from "./app/config/env";

const app = express();
app.use(expressSession({
    secret: "your secret",
    resave: false,
    saveUninitialized: false
}))
app.use(express.json());
app.set("trust proxy", 1)
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: envVars.FRONTEND_URL,
    credentials: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use("/api/v1", router)


app.get("/", (req: Request, res: Response) => {
    res.send('Welcome to Tour Management System Backend')
});


app.use(globalErrorHandler);

app.use(notFound)



export default app;