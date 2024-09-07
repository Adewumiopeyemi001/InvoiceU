import express from 'express';
import {register, login, verifyEmail, getProfile, updateProfile} from '../controllers/users.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import upload from "../public/images/multer.js"

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.get('/myprofile', authenticateUser, getProfile);
router.put('/updateprofile', authenticateUser, upload.single("profilePicture"), updateProfile);


export default router;