import express from 'express';
import { createEventAdapter } from '@slack/events-api';
import dotenv from 'dotenv';
import { handleAppMention, handleReactionAdded, handleReactionRemoved } from '../controllers/eventController.js';

dotenv.config();

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const router = express.Router();

router.use('/events', slackEvents.expressMiddleware());
// Handle app mentions
slackEvents.on('app_mention', async (event) => {
  console.log('🔔 App mentioned:', event.text);
  await handleAppMention(event);
});
slackEvents.on('reaction_added', async (event) => {
  console.log('Reacted to app');
  await handleReactionAdded(event);
})
slackEvents.on('reaction_removed', async (event) => {
  console.log('removed reaction');
  await handleReactionRemoved(event);
})

slackEvents.on('error', console.error);


export default router;
