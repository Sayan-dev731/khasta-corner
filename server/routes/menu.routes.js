import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    addMenu,
    deleteMenuItem,
    editMenu,
    editMenuItemImage,
    getMenu,
} from "../controllers/menu.controllers.js";

const menuRouter = express.Router();

menuRouter
    .route("/add")
    .post(upload.fields([{ name: "imageFood", maxCount: 1 }]), addMenu); // route for adding menu description and images as well

menuRouter.route("/get/:_id").get(getMenu);

menuRouter.route("/edit/:_id").post(editMenu);

menuRouter.route("/edit/image/:_id").post(upload.single("imageFood"), editMenuItemImage);

menuRouter.route("/delete/:_id").delete(deleteMenuItem);

export default menuRouter;
