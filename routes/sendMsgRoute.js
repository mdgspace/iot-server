import { Router } from 'express';
import { printFromBro } from '../controllers/printFromBro.js';


const router = Router();

router.post('/sendMsg', printFromBro);
router.get('/sendMsg', printFromBro);

export default router;


