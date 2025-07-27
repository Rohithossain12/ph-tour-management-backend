import { Router } from "express";
import { UserControllers } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/check.auth";
import { Role } from "./user.interface";


const router = Router();




router.post("/register", validateRequest(createUserZodSchema), UserControllers.createUser);

router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPPER_ADMIN), UserControllers.getAllUsers);

router.patch("/:id",validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)


export const UserRoutes = router