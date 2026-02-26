/* global process */
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";

const authMiddleware = async (req, res, next) => {
    try {
        // get the token from the request header and remove the bearer prefix
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized: No token provided");
        }

        // verify the token by decoding it.
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // find the user by the decoded token's user ID
        const user = await User.findById(decodedToken._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(404, "Not Found: User not found");
        }

        // saving the user data in the request object for further use in the next middleware or route handler.
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Unauthorized: Invalid Token"
        );
    }
};

export { authMiddleware };
