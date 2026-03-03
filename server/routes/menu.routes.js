import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    addMenu,
    deleteMenuItem,
    editMenu,
    editMenuItemImage,
    getMenu,
    getMenuItem,
} from "../controllers/menu.controllers.js";

const menuRouter = express.Router();

menuRouter
    .route("/add")
    .post(upload.fields([{ name: "imageFood", maxCount: 1 }]), addMenu); // route for adding menu description and images as well

menuRouter.route("/get/:_id").get(getMenuItem);

menuRouter.route("/edit/:_id").patch(editMenu);

menuRouter.route("/edit/image/:_id").post(upload.single("imageFood"), editMenuItemImage);

menuRouter.route("/delete/:_id").delete(deleteMenuItem);

menuRouter.route("/").get(getMenu);

export default menuRouter;
