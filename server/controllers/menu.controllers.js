import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { MenuCollection } from "../models/menuCollection.models.js";
import { deleteFile, uploadFiles } from "../utils/cloudinary.js";

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
    const { name, description, price, category, isAvailable } = req.body;

    if (!name || !description || !price || !category || !isAvailable) {
        throw new ApiError(400, "Bad Request:  All fields are required");
    }

    if (isAvailable !== "true" && isAvailable !== "false") {
        throw new ApiError(
            400,
            "Bad Request: The value of isAvailable field should be eith true or false"
        );
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
        isAvailable,
    });

    if (!menuItem) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to add the menu item"
        );
    }

    return res.json(new ApiResponse(200, null, "Menu item Added Successfully"));
});

const getMenu = asyncHandler(async (req, res) => {
    const menuItems = await MenuCollection.findById(req.params?._id);

    if (!menuItems) {
        throw new ApiError(404, "Menu item not found");
    }

    return res.json(
        new ApiResponse(200, menuItems, "Menu item fetched successfully")
    );
});

const editMenu = asyncHandler(async (req, res) => {
    const menuItem = await MenuCollection.findById(req.params?._id);

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found");
    }

    const { name, description, price, category, isAvailable } = req.body;

    if (!name && !description && !price && !category && !isAvailable) {
        throw new ApiError(
            400,
            "Bad Request: At least one field is required to update the menu item"
        );
    }

    const menuItemUpdate = await MenuCollection.findByIdAndUpdate(
        req.params?._id,
        {
            $set: {
                name,
                description,
                price,
                category,
                isAvailable,
            },
        },
        {
            returnDocument: "after",
        }
    );

    if (!menuItemUpdate) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to  update the menu item"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                menuItemUpdate,
                "Menu item updated successfully"
            )
        );
});

const editMenuItemImage = asyncHandler(async (req, res) => {
    const menuItem = await MenuCollection.findById(req.params?._id);

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found");
    }

    const newImageFoodLocalPath = req.file?.path;

    if (!newImageFoodLocalPath) {
        throw new ApiError(400, "Bad Request: No image file uploaded");
    }

    const oldImageFoodUrl = menuItem.imageFood;

    if (!oldImageFoodUrl) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to fetch the old image URL"
        );
    }

    const deleteOldImageUrl = await deleteFile(oldImageFoodUrl);

    if (!deleteOldImageUrl) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to delete the old image from cloudinary"
        );
    }

    const newMenuImageFood = await uploadFiles(newImageFoodLocalPath);

    if (!newMenuImageFood.url) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to upload the new image to cloudinary"
        );
    }

    const menuItemImageUpdate = await MenuCollection.findByIdAndUpdate(
        req.params?._id,
        {
            imageFood: newMenuImageFood.url,
        },
        {
            returnDocument: "after",
        }
    );

    if (!menuItemImageUpdate) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to update the menu item image in the database"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                menuItemImageUpdate,
                "Menu item image updated successfully"
            )
        );
});

const deleteMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await MenuCollection.findById(req.params?._id);

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found");
    }

    const deleteMenuItemImage = await deleteFile(menuItem.imageFood);

    if (!deleteMenuItemImage) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to delete the menu item image from cloudinary"
        );
    }

    const deleteMenuItemImageResult = await deleteFile(menuItem.imageFood);

    if (!deleteMenuItemImageResult) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to delete the menu item image from cloudinary"
        );
    }

    const deleteMenuItem = await MenuCollection.findByIdAndDelete(
        req.params?._id
    );

    if (!deleteMenuItem) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to delete the menu item from the database"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Menu item deleted successfully"));
});

export { addMenu, getMenu, editMenu, editMenuItemImage, deleteMenuItem };
