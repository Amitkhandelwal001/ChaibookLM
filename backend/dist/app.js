"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false })); // allow images to load
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is healthy' });
});
// Global Error Handler
app.use(error_middleware_1.globalErrorHandler);
exports.default = app;
