import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MenuCollection } from "../models/menuCollection.models.js";
import { uploadFiles } from "../utils/cloudinary.js";

const addMenu = asyncHandler(async (req, res) => {
    // check if the requested files are there or not
    if (!req.files && !req.files.imageFood) {
        throw new ApiError(400, "Bad Request: No image files uploaded");
    }

    // chceck if the request body is there or not
    if (!req.body) {
        throw new ApiError(400, "Bad Request: Request body not found");
    }

    // get the data from the frontned admin to add in the menu collection
    const { name, description, price, category } = req.body;

    if (!name || !description || !price || !category) {
        throw new ApiError(400, "Bad Request:  All fields are required");
    }

    // check the existing menu item with the same name

    const existingMenuItem = await MenuCollection.findOne({
        $and: [{ name }, { description }],
    });

    if (existingMenuItem) {
        throw new ApiError(
            409,
            "Conflict: menu item with the same name or description already exists"
        );
    }

    // check for image files are there or not
    const imageFoodLocalPath = req.files?.imageFood[0]?.path;
    // let imageFoodLocalPath;
    // if (
    //     req.files &&
    //     Array.isArray(req.files.imageFood) &&
    //     req.files.imageFood.length > 0
    // ) {
    //     imageFoodLocalPath = req.files.imageFood[0].path;
    // }

    if (!imageFoodLocalPath) {
        throw new ApiError(400, "Bad Request: No image files uploaded");
    }

    // send the image files to the cloudinary and get the url

    const imageFood = await uploadFiles(imageFoodLocalPath);

    if (!imageFood) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to upload the image"
        );
    }

    // create the menu item in the databse
    const menuItem = await MenuCollection.create({
        name,
        description,
        price,
        category,
        imageFood: imageFood.url,
    });

    if (!menuItem) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to add the menu item"
        );
    }

    return res.json(new ApiResponse(200, null, "Menu item Added Successfully"));
});

export { addMenu };
