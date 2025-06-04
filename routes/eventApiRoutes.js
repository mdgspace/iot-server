import express from 'express'
import { fetchAttendeeNames } from '../controllers/eventController.js'

const router = express.Router();

router.get('/getEvent', fetchAttendeeNames);

export default router;