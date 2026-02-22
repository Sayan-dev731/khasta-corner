import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    if (!user) {
        throw new ApiError(500, "Interal Server Error: Failed to create user");
    }

    return res.json(
        new ApiResponse(200, null, "User got registered Sucessfully")
    );
});

// const registerUser = (req, res) => {
//     return res.json({
//         message: "Register route working 🚀",
//     });
// };

export { registerUser };
