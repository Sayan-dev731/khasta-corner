import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    //create the user in the database
    const user = await User.create({
        fullName,
        email,
        password,
        phone,
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

    // checkinf if the request body is empty or not
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

export { registerUser, loginUser };
