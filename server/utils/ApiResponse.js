class ApiResponse {
    constructor(statusCode, data, message="successfully completed") {
        this.statusCode = statusCode;
        this.message = ["success", message];
        this.data = data;
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
