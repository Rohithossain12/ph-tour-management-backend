
import { envVars } from "../config/env";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs"


export const seedSupperAdmin = async () => {
    try {
        const isSupperAdminExist = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL });

        if (isSupperAdminExist) {
            console.log("Supper Admin Already Exist");
            return
        }

        console.log("trying to create supper admin");
        const hashPassword = await bcryptjs.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND))

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: envVars.SUPER_ADMIN_EMAIL as string
        }

        const payload: IUser = {
            name: "supper admin",
            role: Role.SUPPER_ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashPassword,
            isVerified: true,
            auths: [authProvider]

        }

        const supperAdmin = await User.create(payload);
        console.log("Supper Admin Created Successfully");
        console.log(supperAdmin);

    } catch (error) {
        console.log(error);
    }
}