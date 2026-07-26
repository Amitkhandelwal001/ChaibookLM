"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_repository_1 = require("../repositories/user.repository");
const AppError_1 = require("../utils/AppError");
const jwt_utils_1 = require("../utils/jwt.utils");
const register = async (data) => {
    const existingUser = await (0, user_repository_1.findUserByEmail)(data.email);
    if (existingUser) {
        throw new AppError_1.AppError('Email already in use', 400);
    }
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    const user = await (0, user_repository_1.createUser)({
        name: data.name,
        email: data.email,
        password: hashedPassword,
    });
    const token = (0, jwt_utils_1.generateToken)(user.id);
    return { user: { id: user.id, name: user.name, email: user.email, storageUsed: user.storageUsed }, token };
};
exports.register = register;
const login = async (data) => {
    const user = await (0, user_repository_1.findUserByEmail)(data.email);
    if (!user) {
        throw new AppError_1.AppError('Invalid email or password', 401);
    }
    const isPasswordValid = await bcryptjs_1.default.compare(data.password, user.password);
    if (!isPasswordValid) {
        throw new AppError_1.AppError('Invalid email or password', 401);
    }
    const token = (0, jwt_utils_1.generateToken)(user.id);
    return { user: { id: user.id, name: user.name, email: user.email, storageUsed: user.storageUsed }, token };
};
exports.login = login;
const getMe = async (userId) => {
    const user = await (0, user_repository_1.findUserById)(userId);
    if (!user) {
        throw new AppError_1.AppError('User not found', 404);
    }
    return { id: user.id, name: user.name, email: user.email, storageUsed: user.storageUsed };
};
exports.getMe = getMe;
