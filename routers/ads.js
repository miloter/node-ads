import express from 'express';
import {
    adsGet,
    apiAdsGet,
    apiAdsIdDelete,
    apiAdsIdPut,
} from '../controllers/ads.js';
import { requireAuthorization } from '../helpers/utils.js';

const adsRouter = express.Router();

adsRouter.get('/ads', requireAuthorization, adsGet);
adsRouter.get('/api/ads', requireAuthorization, apiAdsGet);
adsRouter.delete('/api/ads/:id', requireAuthorization, apiAdsIdDelete);
adsRouter.put('/api/ads', requireAuthorization, apiAdsIdPut);

export default adsRouter;
