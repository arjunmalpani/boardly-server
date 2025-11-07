import express from 'express';
import { verifyMiddleware } from '../middlewares/verifyMiddleware.js';
import { get } from 'mongoose';
import { createSpaceController, getMySpacesController, getSpaceByIdController, inviteUserToSpaceController } from '../controllers/space.controller.js';

const router = express.Router();

router.post('/createSpace', verifyMiddleware, createSpaceController);

router.get('/:spaceId', verifyMiddleware, getSpaceByIdController);

router.get('/', verifyMiddleware, getMySpacesController);

router.put("/:id/invite", verifyMiddleware, inviteUserToSpaceController);

export default router;