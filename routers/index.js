import express from 'express';
import {
    indexGet,
} from '../controllers/index.js';
import { getAuthenticatedUser, requireAuthorization } from '../helpers/utils.js';

const indexRouter = express.Router();

indexRouter.get('/', getAuthenticatedUser, indexGet);

export default indexRouter;
