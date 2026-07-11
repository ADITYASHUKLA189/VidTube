class ApiResponse {
    constructor(statusCode, success, message="success", data) {
        this.statusCode = statusCode < 400;
        this.success = success;
        this.message = message;
        this.data = data;
    }
}

export default ApiResponse;