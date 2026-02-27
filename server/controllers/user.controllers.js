/* global process */

import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { deleteFile, uploadFiles } from "../utils/cloudinary.js";

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "Not Found: User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            error?.message ||
                "Internal Server Error: Failed to generate tokens."
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // checking if the request coming from is frontend is empty or undefined
    if (!req.body) {
        throw new ApiError(400, "Bad Request: Request body not found");
    }
    // get the data from the frontend client
    const { fullName, email, password, phone, role } = req.body;

    // validation not empty fields
    if (!fullName || !email || !password || !phone || !role) {
        throw new ApiError(400, "Bad Request: All fields are required");
    }

    const allowedRoles = ["User", "Admin"];

    if (!allowedRoles.includes(role)) {
        throw new ApiError(400, "Bad Request: Invalid role provided");
    }

    const localProfileImagePath = req.file?.path;

    if (!localProfileImagePath) {
        throw new ApiError(400, "Bad Request: Profile image is required");
    }

    // check if the user already exists
    const userExists = await User.findOne({
        $or: [{ email }, { phone }],
    });

    if (userExists) {
        throw new ApiError(
            409,
            "Conflict: User with this email or phone already exists"
        );
    }

    //upload the profile image to cloudinary and ge the url
    const profileImageUrl = await uploadFiles(localProfileImagePath);

    if (!profileImageUrl.url) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to upload the profile image to cloudinary"
        );
    }

    //create the user in the database
    const user = await User.create({
        fullName,
        email,
        password,
        phone,
        profileImage: profileImageUrl.url,
        role,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Interal Server Error: Failed to create user");
    }

    return res.json(
        new ApiResponse(200, null, "User got registered Sucessfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // geting the data from the frontend client
    const { email, phone, password } = req.body;

    // checking if the request body is empty or not
    if (!(email || phone)) {
        throw new ApiError(
            400,
            "Bad Request: Email and phone number are required for login"
        );
    }

    // the user will give phoneNumber or the email to login to check the user exist or not
    const user = await User.findOne({
        $or: [{ email }, { phone }],
    });

    if (!user) {
        throw new ApiError(
            404,
            "Not Found: User not found with the provided credentials"
        );
    }

    // check with the data if the entered password is correct or not
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Unauthorized: Invalid password");
    }

    // genereating the access token and refresh token for the user
    const { accessToken, refreshToken } = await generateTokens(user._id);
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    // send cookies and response to the frontend client
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User Logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    //get the user Id from the request object
    const user = req.user._id;

    if (!user) {
        throw new ApiError(404, "Not Found: User not found!");
    }

    // remove the refresh token from the database for the user
    await User.findByIdAndUpdate(
        user,
        {
            $set: {
                refreshToken: null,
            },
        },
        {
            returnDocument: "after",
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("refreshToken", options)
        .cookie("accessToken", options)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
    // get the refresh token from the request headers or the cookies
    const incomingRefreshToken =
        req.cookies?.refreshToken ||
        req.headers("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized: No refresh token provided.");
    }

    try {
        // verify the refresh token by decoding it
        const decodeToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        //getting the user by the decoded token's user ID
        const user = await User.findById(decodeToken._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(404, "Not found: User not found.");
        }

        // check if the refresh token in the database matches the one provided in the request
        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized: Invalid refresh token.");
        }

        // generate new access token and refresh token
        const { accessToken, newRefreshToken } = await generateTokens(user._id);

        // // update the refresh token in the database
        // user.refreshToken = newRefreshToken;

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Tokens refreshed Successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Unauthorized: Invalid refresh token."
        );
    }
});

const changePassword = asyncHandler(async (req, res) => {
    // get the user id from the request object passed by the auth middleware and find the user in the database
    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "Not Found: User not found!");
    }
    // get the old password, new password and confirm new password from the request body
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // validate the input data
    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "Bad Request: All fields are required");
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(
            400,
            "Bad Request: The new password and the confirm new password do not match"
        );
    }

    // check if the old password is correct by comparing it with the hashed password in the database
    const isOldPasswordValid = await user.comparePassword(oldPassword);

    if (!isOldPasswordValid) {
        throw new ApiError(401, "Unauthorized: Old password is incorrect");
    }

    // if the old password is correct, hash the new password and replace the old password with the new password in the database
    user.password = newPassword;

    await user.save({
        validateBeforeSave: false,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Password changed successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    // get the details to be updated from the request body
    const { fullName, email, phone } = req.body;

    // validate the input data
    if (!fullName && !email && !phone) {
        throw new ApiError(
            400,
            "Bad Request: At least one field is required to update the account details"
        );
    }

    // find the user id and update the account details in the database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email?.toLowerCase(),
                phone,
            },
        },
        {
            returnDocument: "after",
        }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current user details fetched successfully"
            )
        );
});

const updateProfileImage = asyncHandler(async (req, res) => {
    // get the new image path from the request file object
    const localProfileImagePath = req.file?.path;

    if (!localProfileImagePath) {
        throw new ApiError(400, "Bad Request: Profile image is required");
    }

    // delete the existing profile image from cloudinary
    const deleteProfileImage = await deleteFile(req.user?.profileImage);

    if (!deleteProfileImage) {
        throw new ApiError(
            500,
            "Interal Server Error: Failed to delete the existing profile image from cloudinary"
        );
    }

    const newProfileImage = await uploadFiles(localProfileImagePath);

    if (!newProfileImage.url) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to upload the profile image to cloudinary"
        );
    }

    const updateUserProfileImage = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                profileImage: newProfileImage.url,
            },
        },
        {
            returnDocument: "after",
        }
    );

    if (!updateUserProfileImage) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to update the profile image in the database"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Profile image updated successfully"));
});

const deleteAccount = asyncHandler(async (req, res) => {
    // get the user from the auth middleware
    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "Not Found: User not found!");
    }

    // delete the profile image from the cloudinary
    const deleteProfileImage = await deleteFile(user.profileImage);

    if (!deleteProfileImage) {
        throw new ApiError(
            500,
            "Internal Server Error: Failed to delete the profile image from cloudinary"
        );
    }

    // delete the user profile from the database
    await User.findByIdAndDelete(req.user?._id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "User account deleted successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    changePassword,
    updateAccountDetails,
    getCurrentUser,
    updateProfileImage,
    deleteAccount,
};
