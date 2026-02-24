import express from "express";
import { loginUser, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/register").post(upload.none(), registerUser); // using multer to handle multipart/form-data, but since we are not uploading any files, we use upload.none() to parse the form data without expecting any files.

router.route("/login").post(loginUser); // for logging in the user in the web app.

export default router;
