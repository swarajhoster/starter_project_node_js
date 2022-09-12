const errorResponse = (message, extra = {}) => {
    return {
        error: true,
        message: message || "Something went wrong",
        ...extra
    }
};

const successResponse = (message, data, extra = {}) => {
    return {
        error: false,
        message: message || "Operation Successful",
        data: data || {},
        ...extra
    }
};

module.exports = {
    errorResponse,
    successResponse
};
