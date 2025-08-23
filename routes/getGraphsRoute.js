import express from 'express'
import { myGraph, graphByTag } from '../controllers/graphsController.js'

const router = express.Router();

router.get('/me/:slackname/:timeframe', myGraph); // options for timeframe: weekly, monthly, alltime
router.get('/bytag/:tag/:timeframe', graphByTag); // options for timeframe: alltime, weekly, monthly

export default router;