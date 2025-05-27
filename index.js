import express from 'express';
// import { fileURLToPath } from 'url';
// import path from 'path';
import dotenv from 'dotenv';
import sendMsgRoute from './routes/sendMsgRoute.js';
import keyHolderRoutes from './routes/keyHolderRoutes.js';
import cors from 'cors';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  

app.use('/api/message', sendMsgRoute);
app.use('/api/keyHolders', keyHolderRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});