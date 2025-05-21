import express, { Router } from 'express';
import { printFromBro } from '../controllers/printFromBro.js';
import axios from 'axios';

const router = Router();

router.post('/sendMsg', printFromBro);
router.get('/sendMsg', printFromBro);

export default router;


