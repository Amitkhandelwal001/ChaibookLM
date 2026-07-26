"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const AppError_1 = require("../utils/AppError");
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError_1.AppError('You are not logged in! Please log in to get access.', 401));
    }
    try {
        const decoded = (0, jwt_utils_1.verifyToken)(token);
        // @ts-ignore
        req.user = { id: decoded.id };
        next();
    }
    catch (error) {
        return next(new AppError_1.AppError('Invalid token. Please log in again.', 401));
    }
};
exports.protect = protect;
