"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const whiteboard_controller_1 = require("../controllers/whiteboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get('/', whiteboard_controller_1.listWhiteboardsHandler);
router.get('/:id', whiteboard_controller_1.getWhiteboardHandler);
router.post('/', whiteboard_controller_1.saveWhiteboardHandler);
exports.default = router;
