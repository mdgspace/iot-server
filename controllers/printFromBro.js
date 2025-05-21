import express, { Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

const app = express();
dotenv.config();
const router = express.Router();

app.use(express.json());

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID;


const messageOpen = "Bro who is Ishaan";
const messageClose = "Bro is closed";
let currentBroStatus = true;
let prevBroStatus = false;

function reverseBroStatus() {
    let message = "";
    if(currentBroStatus)
    {
        currentBroStatus = false;
        message = messageClose;
    }else
    {
        currentBroStatus = true;
        message = messageOpen;
    }
    return message;
}

export const printFromBro = async (req, res) => 
{
    let message = reverseBroStatus();
    console.log("Bro status changed to: " + message);
    try
    {
        const result = await postMessageToSlack(message);

        return res.status(200).json({ 
            success: true, 
            message: "Message posted to Slack successfully.",
            slackResponse: result
        });

    }catch (error) 
    {
        console.error('Error posting message to Slack:', error);
        return res.status(500).json({ error: 'Failed to post message to Slack' });
    }
}






const postMessageToSlack = async (message) => 
{
    let response = null;
    try
    {
        response = await axios.post('https://slack.com/api/chat.postMessage', {
            "channel": CHANNEL_ID,
            "text": message,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SLACK_TOKEN}`,
            },
        });
    }catch (error)
    {
        console.error('Error posting message to Slack:', error);
    }

    return response.data;
}

