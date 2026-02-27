/* global process */
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {ApiError} from "./ApiError.js"
import dotenv from "dotenv";
dotenv.config();

import { extractPublicId } from "cloudinary-build-url";

const extractPublicIdFromUrl = async (url) => {
    try {
        if (!url) return true;

        const publicId = extractPublicId(url)

        if (!publicId) {
            throw new ApiError(500, "Failed to extract public ID from the cloudinary URL");
        }

        return publicId; 
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid URL format")
    }
} 

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

const deleteFile = async (url) => {
    try {
        const publicId = await extractPublicIdFromUrl(url);

        if(!publicId) {
            throw new ApiError(400, " Invalid URL: Unable to extract piublic ID from the cloudinary file URL")
        }

        const result = await cloudinary.uploader.destroy(publicId);

        return result;
    } catch (error) {
        throw new ApiError(500, error?.message || "Failed to delete the file from the cloudinary");
    }
}

export { uploadFiles, deleteFile };
