/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import { Strategy as localStrategy } from "passport-local";
import bcrypt from "bcryptjs";


passport.use(
    new localStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isUserExist = await User.findOne({ email });


            if (!isUserExist) {
                return done(null, false, { message: "user does not exist" })
            };

            if (!isUserExist.isVerified) {
               return done('User is not verified')
            }

            if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
              return  done(`User is ${isUserExist.isActive}`)
            };
            if (isUserExist.isDeleted) {
              return   done('User is deleted')
            };



            const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider == "google");


            if (isGoogleAuthenticated) {
                return done(null, false, { message: "you have authenticated through Google. so if you want to login with credentials , then at first login with google and set a password for your gmail and then you can login with email and password " })
            }


            const isPasswordMatch = await bcrypt.compare(password as string, isUserExist.password as string)

            if (!isPasswordMatch) {
                return done(null, false, { message: "Password does not match" })
            };

            return done(null, isUserExist)


        } catch (error) {
            done(error)
        }
    })
)


passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL
        }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const email = profile.emails?.[0].value;

                if (!email) {
                    return done(null, false, { message: "No Email Found" })
                }

                let isUserExist = await User.findOne({ email });


                if (isUserExist && !isUserExist.isVerified) {
                    // done('User is not verified')
                  return done(null,false,{message: "User is not verified"})
                }

                if (isUserExist && (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE)) {
                   return done(`User is ${isUserExist.isActive}`)
                };
                if (isUserExist &&isUserExist.isDeleted) {
                    return done(null,false,{message: "User is deleted"})
                };


                if (!isUserExist) {
                   isUserExist = await User.create({
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        role: Role.USER,
                        isVerified: true,
                        auths: [{
                            provider: "google",
                            providerId: profile.id
                        }]

                    })
                }

                return done(null, isUserExist)

            } catch (error) {
                return done(error)
            }
        }
    )
)





passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {

    done(null, user._id)
})



passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user)
    } catch (error) {
        done(error)
    }
})