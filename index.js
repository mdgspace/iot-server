import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

import sendMsgRoute from './routes/sendMsgRoute.js';
import keyHolderRoutes from './routes/keyHolderRoutes.js';
import labHoursRoutes from './routes/labHoursRoutes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();


app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/message', sendMsgRoute);
app.use('/api/keyHolders', keyHolderRoutes);
app.use('/api/labHours', labHoursRoutes)

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});