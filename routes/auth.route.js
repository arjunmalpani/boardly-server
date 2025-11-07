import express from 'express';
import { checkAuthController, loginController, logoutController, profileController, registerController } from '../controllers/auth.controller.js';
import upload from '../configs/multer.js';
import { checkIfLoggedInMiddleware } from '../middlewares/checkIfLoggedInMiddleware.js';
import { verifyMiddleware } from '../middlewares/verifyMiddleware.js';

const router = express.Router()
router.post('/register', checkIfLoggedInMiddleware, upload.single('avatar'), registerController)
router.post('/login', checkIfLoggedInMiddleware, loginController)

router.get('/profile', verifyMiddleware, profileController);
router.get('/logout', logoutController)
router.get('/check', verifyMiddleware, checkAuthController)
export default router;