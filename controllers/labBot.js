import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { WebClient } from '@slack/web-api';

dotenv.config();
const slackClient = new WebClient(process.env.LAB_BOT_TOKEN);
const BotToken = process.env.LAB_BOT_TOKEN;

const LABOPENCLOSE_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

const messageOpen = "Bro lab is open";
const messageClose = "Bro lab is closed";
let currentBroStatus = true;

function reverseBroStatus() {
    currentBroStatus = !currentBroStatus
    return currentBroStatus ? messageOpen : messageClose
}

export const listenToGraphReq = async (req, res) => {

}

export const handleAppMention = async (event) => {
    const { text, channel, user, ts } = event;

    console.log(text);

    // const event_time = parseEventTime(text);
    // console.log('Event time:', event_time);
    // const emoji = parseEmoji(text);

    // if (!event_time) {
    //     console.log(' Message does not contain valid event time');
    //     return;
    // }
    // if (!emoji) {
    //     console.log('Message does not contain valid emoji')
    //     return;
    // }

    // const createEventObj =
    // {
    //     message: text,
    //     channel: channel,
    //     created_by: user,
    //     event_time: event_time,
    //     emoji: emoji,
    //     ts: ts
    // }

    // try {
    //     const result = await createEvent(createEventObj);

    //     console.log(' Event stored in DB:', result.rows[0]);
    //     const message = "Event successfully created!";
    //     postMessageToSlack(message, createEventObj.channel);
    // } catch (err) {
    //     console.error(' Error storing event:', err);
    // }
};



export const printFromBro = async (req, res) => {
    let message = reverseBroStatus();
    console.log("Bro status changed to: " + message);
    try {
        const result = await postMessageToSlack(message);

        return res.status(200).json({
            success: true,
            message: "Message posted to Slack successfully.",
            slackResponse: result
        });

    } catch (error) {
        console.error('Error posting message to Slack:', error);
        return res.status(500).json({ error: 'Failed to post message to Slack' });
    }
}


const postMessageToSlack = async (message) => {
    let response = null;
    try {
        response = await axios.post(process.env.BASE_URL, {
            "channel": LABOPENCLOSE_CHANNEL_ID,
            "text": message,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SLACK_TOKEN}`,
            },
        });
    } catch (error) {
        console.error('Error posting message to Slack:', error);
    }

    return response.data;
}

