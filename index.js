import express from 'express';
// import { fileURLToPath } from 'url';
// import path from 'path';
import dotenv from 'dotenv';
import sendMsgRoute from './routes/sendMsgRoute.js';
import keyHolderRoutes from './routes/keyHolderRoutes.js';
import labHoursRoutes from './routes/labHoursRoutes.js';
import slackRoutes from './routes/slackRoutes.js';
import eventApiRoutes from './routes/eventApiRoutes.js'
import graphRoutes from './routes/getGraphsRoute.js'

import { startScheduler } from './services/schedulerService.js';

import maintenanceRoute from './routes/maintenanceRoute.js'

import {doMaintenance} from './controllers/maintenance.js'

import cors from 'cors';

import {Worker} from 'node:worker_threads';
dotenv.config();

function spawn_maintenance_thread(){
    const worker = new Worker('./worker.js')
    worker.on('message', async ()=>{
        console.log("starting maintenance")
        await doMaintenance()
        console.log("maintenance performed")
    })
}

const app = express();
app.use('/slack', slackRoutes);

app.use(cors());
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  

app.use('/api/message', sendMsgRoute);
app.use('/api/keyHolders', keyHolderRoutes);
app.use('/api/labHours', labHoursRoutes);
app.use('/api/eventApi', eventApiRoutes);
app.use('/api/graphs/', graphRoutes);
startScheduler();

app.use('/api/maintenance', maintenanceRoute)

spawn_maintenance_thread()

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});