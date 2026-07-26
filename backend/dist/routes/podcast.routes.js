"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const podcast_controller_1 = require("../controllers/podcast.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.post('/generate', podcast_controller_1.generatePodcast);
router.get('/', podcast_controller_1.fetchPodcasts);
exports.default = router;
