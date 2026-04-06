import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateLogin, handleValidationErrors } from '../validators/authValidators.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.get('/me', authMiddleware, authController.getMe);

export default router;
