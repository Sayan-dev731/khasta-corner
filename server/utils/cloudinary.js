/* global process */
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {ApiError} from "./ApiError.js"
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFiles = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        fs.unlinkSync(localFilePath);
        // console.log("cloudinary upload results", result.url)

        return result;
    } catch (error) {
        console.error("Cloudinary upload error", error);

        fs.unlinkSync(localFilePath);
        2;
        throw new ApiError(500, "Failed to upload file to cloudinary")
    }
};

export { uploadFiles };
