import express from "express";
import { addHolder, getAllHolders } from "../controllers/keyHolders.js";

const router = express.Router();

router.get('/getHolders', getAllHolders);
router.post('/addHolder', addHolder);

export default router;