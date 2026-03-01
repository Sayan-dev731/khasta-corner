import express from "express";
import {
    loginUser,
    registerUser,
    logoutUser,
    refreshToken,
    changePassword,
    updateAccountDetails,
    getCurrentUser,
    updateProfileImage,
    deleteAccount,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/register").post(upload.single("profileImage"), registerUser); // using multer to handle multipart/form-data, but since we are not uploading any files, we use upload.none() to parse the form data without expecting any files.

router.route("/login").post(loginUser); // for logging in the user in the web app.

// secure routing for logging out the user in the web app.

router.route("/logout").post(authMiddleware, logoutUser); // for logging out the user in the web app. This route is protected by the authMiddleware to ensure that only authenticated users can access it.

router.route("/refresh-token").post(refreshToken);

router.route("/change-password").post(authMiddleware, changePassword);

router.route("/update-profile").patch(authMiddleware, updateAccountDetails);

router.route("/get-user").get(authMiddleware, getCurrentUser);

router
    .route("/update-profile-image")
    .patch(authMiddleware, upload.single("profileImage"), updateProfileImage);

router.route("/delete-account").delete(authMiddleware, deleteAccount);

export default router;
