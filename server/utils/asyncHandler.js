const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) =>
            next(err)
        );
    };
};

export { asyncHandler };

// const asyncHandler = (requestHandler) => async (req, res, next) => {
//     try {
//         await requestHandler(req, res, next);
//     } catch (err) {
//         console.error(err.message)
//         res.status(err.code || 500).json({
//             success: false,
//             message: "Internal Server Error" + err.message,
//         });
//     }
// };

// export { asyncHandler };
