import express from 'express';
import { requireAuthorization, requireNoAuthorization, upload } from '../helpers/utils.js';
import {
    authSignUpGet, authSignUpPost,
    authLoginGet, authLoginPost, authLogoutGet
} from '../controllers/auth.js';

const authRouter = express.Router();

authRouter.get('/auth/signup', requireNoAuthorization, authSignUpGet);
authRouter.post('/auth/signup', requireNoAuthorization, upload.single('file'), authSignUpPost);
authRouter.get('/auth/login', requireNoAuthorization, authLoginGet);
authRouter.post('/auth/login', requireNoAuthorization, authLoginPost);
authRouter.get('/auth/logout', requireAuthorization, authLogoutGet);

export default authRouter;
