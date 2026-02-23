import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { addMenu } from "../controllers/menu.controllers.js";

const menuRouter = express.Router();

menuRouter
    .route("/add")
    .post(upload.fields([{ name: "imageFood", maxCount: 3 }]), addMenu); // route for adding menu description and images as well

export default menuRouter;
