import pkg from "@slack/bolt";
import dotenv from 'dotenv';
import express from 'express'

import { printFromBro } from './controllers/labBot.js';
import { addHolder, getAllHolders } from "./controllers/keyHolders.js";
import {toggleInOut} from "./controllers/labHours.js";
import { fetchAttendeeNames } from './controllers/eventController.js'
import { myGraph, graphByTag } from './controllers/graphsController.js'
import {setupLogs} from './controllers/maintenance.js'


import { startScheduler } from './services/schedulerService.js';
import {doMaintenance} from './controllers/maintenance.js'

import { handleAppMention as handleAppMention_event, handleReactionAdded, handleReactionRemoved } from './controllers/eventController.js';
import { handleAppMention as handleAppMention_labbot} from './controllers/labBot.js';

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


const App = pkg.App;
const ExpressReceiver = pkg.ExpressReceiver;

const receiver = new ExpressReceiver({ signingSecret: process.env.LAB_BOT_SIGNING_SECRET });

const app = new App({
    token: process.env.LAB_BOT_TOKEN,
    receiver
})


receiver.router.use(cors());
receiver.router.use(express.json());  
receiver.router.use(express.urlencoded({ extended: true }));  

app.event('app_mention', async ({event}) => {
  console.log('App mentioned:', event.text);
  await handleAppMention_event(event);
  await handleAppMention_labbot(event);
});

app.event('reaction_added', async ({event}) => {
  console.log('Reacted to app');
  await handleReactionAdded(event);
});

app.event('reaction_removed', async ({event}) => {
  console.log('removed reaction');
  await handleReactionRemoved(event);
});


receiver.router.get('/api/message/sendMsg', printFromBro);
receiver.router.post('/api/message/sendMsg', printFromBro);

receiver.router.get('/api/keyHolders/getHolders', getAllHolders);
receiver.router.post('/api/keyHolders/addHolder', addHolder);

receiver.router.post('/api/labHours/toggleInOut', toggleInOut);

receiver.router.get('/api/eventApi/getEvent', fetchAttendeeNames);

receiver.router.get('/api/graphs/me/:slackname/:timeframe', myGraph); // options for timeframe: weekly, monthly, alltime
receiver.router.get('/api/graphs/bytag/:tag/:timeframe', graphByTag); // options for timeframe: alltime, weekly, monthly

receiver.router.get('/api/maintenance/setupLogs', setupLogs)

startScheduler();

app.error((err) => {
  console.error('An error occurred:', err);
});

spawn_maintenance_thread()

await app.start(process.env.PORT);
app.logger.info(`App started on port ${process.env.PORT}`);

