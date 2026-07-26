"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserById = exports.findUserByEmail = exports.createUser = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const client_1 = require("@prisma/client");
const createUser = async (data) => {
    return prisma_1.default.user.create({
        data,
    });
};
exports.createUser = createUser;
const findUserByEmail = async (email) => {
    return prisma_1.default.user.findUnique({
        where: { email },
    });
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (id) => {
    return prisma_1.default.user.findUnique({
        where: { id },
    });
};
exports.findUserById = findUserById;
//# sourceMappingURL=user.repository.js.map