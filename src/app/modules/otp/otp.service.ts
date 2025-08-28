import crypto from "crypto"
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../utils/sendEmail";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";

const OTP_EXPIRATION = 2 * 60 // 2 minutes

// ✅ Generate OTP safely
const generateOtp = (length = 6) => {
  const min = 10 ** (length - 1);  // e.g. 100000 for 6 digits
  const max = 10 ** length;        // e.g. 1000000 (exclusive)
  const otp = crypto.randomInt(min, max).toString();
  return otp;
};

const sendOTP = async (email: string, name: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.isVerified) {
    throw new AppError(401, "You are already verified");
  }

  const otp = generateOtp();

  const redisKey = `otp:${email}`;
  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });

  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: {
      name: name,
      otp: otp,
    },
  });
};

const verifyOTP = async (email: string, otp: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.isVerified) {
    throw new AppError(401, "You are already verified");
  }

  const redisKey = `otp:${email}`;
  const saveOtp = await redisClient.get(redisKey);

  if (!saveOtp) {
    throw new AppError(401, "Invalid OTP or OTP expired");
  }

  if (saveOtp !== otp) {
    throw new AppError(401, "Invalid OTP");
  }

  await Promise.all([
    User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
    redisClient.del([redisKey]),
  ]);
};

export const OTPService = {
  sendOTP,
  verifyOTP,
};
