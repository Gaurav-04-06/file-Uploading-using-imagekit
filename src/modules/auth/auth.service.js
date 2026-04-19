import { sendVerificationEmail } from "../../common/config/email.js";
import ApiError from "../../common/utils/api-error.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import User from "./auth.model.js";
import fs from "node:fs";
import imagekit from "../../common/config/imageKit.js";
import crypto from "crypto";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");


const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("Email already exisits");

  const { rawToken, hashedToken } = generateResetToken();

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken: hashedToken,
  });

  // TODO: send an email to user with token: rawToken
  try {
    await sendVerificationEmail(email, rawToken);
  } catch (error) {
    console.error(error);
  }

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;

  return userObj;
};

const login = async ({ email, password }) => {
  //take email and find user in DB
  // then check if password is correct
  // check if verified or not

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid Email or password");

  // somehow I will check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized("Invalid email or password");

  // if (!user.isVerified) {
  //   throw ApiError.forbidden("Please verify your email before loggin");
  // }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { user: userObj, accessToken, refreshToken };
};

const refresh = async (token) => {
  if (!token) throw ApiError.unauthorized("Refresh token missing");
  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user) throw ApiError.unauthorized("User not found");

  if (user.refreshToken !== hashToken(token)) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });

  return { accessToken };
};

const logout = async (userId) => {
  //   const user = await User.findById(userId);
  //   if (!user) throw ApiError.unauthorized("User not found");

  //   user.refreshToken = undefined;
  //   await user.save({ validateBeforeSave: false });

  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.notfound("No acccount with that email");

  const { rawToken, hashedToken } = generateResetToken();
  user.resetPasswordtoken = hashedToken;
  user.resetpasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save();

  //TODO: mail bhejna nhi aata
};

const verifyEmail = async (token) => {
  const hashedToken = hashToken(token);
  const user = await User.findOne({ verificationToken: hashedToken }).select(
    "+verificationToken",
  );

  //if user not found
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
  return user;
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notfound("User not found");
  return user;
};

const handleUpload = async (userId, file) => {
  // imagekit logic here
  try {
    const fileStream = fs.createReadStream(file.path);

    const uploadResponse = await imagekit.files.upload({
      file: fileStream,
      fileName: file.filename,
      folder: "/user-avatars",
    });

    await User.findByIdAndUpdate(
      userId,
      { avatar: uploadResponse.url },
      { returnDocument: "after" },
    );

    fs.unlinkSync(file.path);

    return {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    };
  } catch (error) {
    try {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.error("Error deleting temp file:", err);
    }
    throw error;
  }
};

export {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  getMe,
  verifyEmail,
  handleUpload,
};
