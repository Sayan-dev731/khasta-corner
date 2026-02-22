import express from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.route("/register").post(upload.none(), registerUser); // using multer to handle multipart/form-data, but since we are not uploading any files, we use upload.none() to parse the form data without expecting any files.

export default router;
