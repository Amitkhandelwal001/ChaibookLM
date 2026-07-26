"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./utils/prisma"));
const qdrant_config_1 = require("./config/qdrant.config");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await prisma_1.default.$connect();
        console.log('✅ Database connected successfully');
        await (0, qdrant_config_1.initQdrant)();
        console.log('✅ Qdrant connected successfully');
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Database connection failed', error);
        process.exit(1);
    }
};
startServer();
