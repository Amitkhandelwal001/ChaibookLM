"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// Protect all upload routes
router.use(auth_middleware_1.protect);
router.post('/', upload_middleware_1.uploadMiddleware.single('file'), upload_controller_1.uploadFileHandler);
router.get('/', upload_controller_1.getDocumentsHandler);
exports.default = router;
