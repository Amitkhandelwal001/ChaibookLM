"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeHandler = exports.loginHandler = exports.registerHandler = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_service_1 = require("../services/auth.service");
const auth_validation_1 = require("../validations/auth.validation");
exports.registerHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parsedData = auth_validation_1.registerSchema.parse(req.body);
    const result = await (0, auth_service_1.register)(parsedData);
    res.status(201).json({
        status: 'success',
        data: result,
    });
});
exports.loginHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const parsedData = auth_validation_1.loginSchema.parse(req.body);
    const result = await (0, auth_service_1.login)(parsedData);
    res.status(200).json({
        status: 'success',
        data: result,
    });
});
exports.getMeHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // @ts-ignore - added by authMiddleware
    const userId = req.user.id;
    const user = await (0, auth_service_1.getMe)(userId);
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
//# sourceMappingURL=auth.controller.js.map