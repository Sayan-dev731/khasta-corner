import mongoose from "mongoose";

const menuCollectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        // the url will be stored in the database, the actual image will be stored in a cloud storage service Cloudinary
        imageFood: [
            {
                type: String,
                required: true,
            },
        ],
        isAvailable: {
            type: Boolean,
            default: true,
        },
        category: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const MenuCollection = mongoose.model(
    "MenuCollection",
    menuCollectionSchema
);
