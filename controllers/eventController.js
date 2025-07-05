import parseEventTime from '../services/timeParser.js';
import parseEmoji from '../services/emojiParser.js';
import { createEvent, getEventByTimestamp, getAttendeeById, getLatestEvent, updateStartedFlag } from '../models/eventModel.js';
import { addReaction, removeReaction } from '../models/reactionModel.js';
import axios from 'axios';
import dotenv from 'dotenv';
import { WebClient } from '@slack/web-api';
import { request } from 'express';

dotenv.config();
const slackClient = new WebClient(process.env.EVENT_MANAGER_BOT_TOKEN);

const EventBotToken = process.env.EVENT_MANAGER_BOT_TOKEN;

export const handleAppMention = async (event) => {
  const { text, channel, user, ts } = event;

  const event_time = parseEventTime(text);
  console.log('Event time:', event_time);
  const emoji = parseEmoji(text);

  if (!event_time) {
    console.log(' Message does not contain valid event time');
    return;
  }
  if (!emoji) {
    console.log('Message does not contain valid emoji')
    return;
  }

  const createEventObj =
  {
    message: text,
    channel: channel,
    created_by: user,
    event_time: event_time,
    emoji: emoji,
    ts: ts
  }

  try {
    const result = await createEvent(createEventObj);

    console.log(' Event stored in DB:', result.rows[0]);
    const message = "Event successfully created!";
    postMessageToSlack(message, createEventObj.channel);
  } catch (err) {
    console.error(' Error storing event:', err);
  }
};

const postMessageToSlack = async (message, channelId) => {
  let response = null;
  try {
    response = await axios.post(process.env.BASE_URL, {
      "channel": channelId,
      "text": message,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EventBotToken}`,
      },
    });
  } catch (error) {
    console.error('Error posting message to Slack:', error);
  }

  return response.data;
}

export const handleReactionAdded = async (event) => {
  try{

    console.log('Processing reaction_added event');
    const { user, reaction, item } = event;
  
    const savedEvent = await getEventByTimestamp(item.ts);
    // console.log(reaction);
    // console.log(item);
    // console.log(savedEvent);
  
    const savedEmojiArr = savedEvent.emoji.split(':');
    const savedEmoji = savedEmojiArr[1];
  
  
  
    if (reaction == savedEmoji) {
      const params = {
        event_id: savedEvent.id,
        user_id: user,
        reaction: reaction,
      }
      await addReaction(params);
      return;
    } else {
      console.log("Emoji does not match required emoji");
      return;
    }
  } catch(err)
  {
    console.error(err);
    return;
  }
}

export const handleReactionRemoved = async (event) => {
  console.log('👍 Processing reaction_added event');

  try{
    const { user, reaction, item } = event;
  
    const savedEvent = await getEventByTimestamp(item.ts);
    // console.log(reaction);
    // console.log(item);
    // console.log(savedEvent);
  
    const savedEmojiArr = savedEvent.emoji.split(':');
    const savedEmoji = savedEmojiArr[1];
  
  
  
    if (reaction == savedEmoji) {
      const params = {
        event_id: savedEvent.id,
        user_id: user,
        reaction: reaction,
      }
      await removeReaction(params);
      return;
    } else {
      console.log("Emoji does not match required emoji");
      return;
    }
  }catch (err)
  {
    console.error(err);
    return;
  }
}

export const fetchAttendeeNames = async (req, res) => {
  try {
    const [event] = await getLatestEvent();
    console.log("This is event: ", event);
    if (!event) {
      return res.json({ message: 'No Event Found', rows: [] });
    }
    const eventId = event.id;
    console.log(eventId);
    const uids = await getAttendeeById(eventId);

    const names = [];

    for (const userId of uids) {
      try {
        const userInfo = await slackClient.users.info({ user: userId });
        const name = userInfo.user.profile.display_name || userInfo.user.real_name || userId;
        names.push(name);
      } catch (err) {
        console.error(`Failed to fetch name for user ${userId}`, err.data?.error);
        names.push(userId);
      }
    }

    return res.json({ message: 'Event Found', rows: names });
  } catch (error) {
    console.log("error occured!");
    console.log(error)
    res.status(500).json({ message: 'Server Error', rows: [] });
  }




}