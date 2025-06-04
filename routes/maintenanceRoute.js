import {Router} from 'express'
import {setupLogs} from '../controllers/maintenance.js'

const router = Router();

router.get('/setupLogs', setupLogs)

export default router;