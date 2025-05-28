import express from "express";
import {toggleInOut} from "../controllers/labHours.js";

const router = express.Router();

router.post('/toggleInOut', toggleInOut);

export default router;