import * as authService from "./auth.service.js";
import ApiError from "../../common/utils/api-error.js";
import ApiResponse from "../../common/utils/api-response.js";

const register = async (req, res) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, "Registration success", user);
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  ApiResponse.ok(res, "Login successful", { user, accessToken });
};

const logout = async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie("refreshToken");
  ApiResponse.ok(res, "Logout Success");
};

const getMe = async (req, res) => {
  const user = await authService.getMe(req.user.id);
  ApiResponse.ok(res, "User Profile", user);
};

const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;
    // console.log("File reached upload avatar function");

    if (!file) {
      return ApiError.badRequest("File not uploaded");
    }

    // console.log("File is present");

    const result = await authService.handleUpload(req.user.id, file);

    return ApiResponse.ok(res, "Avatar uploaded successfully", {
      avatarUrl: result.url,
    });
  } catch (error) {
    console.error("Error in uploadAvatar function:", error); 
    throw error;
  }
};

export { register, login, logout, getMe, uploadAvatar };
