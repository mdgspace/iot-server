import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { WebClient } from '@slack/web-api';
import { MyChart, TagChart, MyData, TagData } from '../services/graphs.js';

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

async function sendMessage(channelId, text) {
    try {
        await slackClient.chat.postMessage({
            channel: channelId,
            text: text,
        });
    } catch (error) {
        console.error('Error posting message:', error);
    }
}


async function uploadImage(channelId, imageBuffer) {
    console.log(channelId)
    try {
        await slackClient.files.uploadV2({
            file: imageBuffer,
            filename: 'graph.png',
            title: 'Labtime graph',
            alt_text: 'Labtime graph',
            channel_id: channelId,
        });

        return 1;
    } catch (error) {
        console.log(error)
        return 0;
    }
}


export const handleAppMention = async (event) => {
    const { text, channel, user, ts } = event;

    console.log(text);
    console.log(channel);
    console.log(user);
    console.log(ts);


    let msg_start = text.indexOf('>');
    if (msg_start == -1) {
        return;
    }

    let msg_text = text.substring(msg_start + 1).trim();

    if (msg_text.toLowerCase() === "help") {
        sendMessage(channel, `Commands:
            @LabHours bot labtime <@user or @tag> <daily/weekly/monthly/alltime> -> Gives a graph of lab time
            @LabHours bot help -> Displays this help menu`);
        return;
    }

    else if (msg_text.toLowerCase() === "hi" || msg_text.toLowerCase() === "hello") {
        sendMessage(channel, `Hi <@${user}>`);
        return;
    }

    else if (msg_text.split(" ")[0] === "labtime") {

        if (msg_text.split(" ")[1] === "graph") {

            let split_text = msg_text.split(" ");
            if (split_text[2].startsWith("<@")) {
                let uid = split_text[2].substring(2, split_text[2].length - 1);
                const result = await slackClient.users.info({ user: uid });

                const slackname = result.user.profile.display_name;

                if (!(["daily", "weekly", "monthly", "alltime"].includes(split_text[3].toLowerCase()))) {
                    sendMessage(channel, "Tell me a reasonable timeframe");
                    return;
                }

                let graph_buffer = await MyChart(slackname, split_text[3].toLowerCase());

                if (graph_buffer == null) {
                    sendMessage(channel, "[ -_- ] something went wrong");
                    return;
                }
                if (!uploadImage(channel, graph_buffer)) {
                    sendMessage(channel, "[ -_- ] failed to upload image");
                    return;

                }



            }
            else if (split_text[2].startsWith("@")) {
                let tag = split_text[2].substring(1);

                if (!(["daily", "weekly", "monthly", "alltime"].includes(split_text[3].toLowerCase()))) {
                    sendMessage(channel, "Tell me a reasonable timeframe");
                    return;
                }

                let graph_buffer = await TagChart(tag, split_text[3].toLowerCase());
                if (graph_buffer == null) {
                    sendMessage(channel, "[ -_- ] something went wrong");
                    return;
                }
                if (!uploadImage(channel, graph_buffer)) {
                    sendMessage(channel, "[ -_- ] failed to upload image");
                    return;

                }

            }
        }

        if (msg_text.split(" ")[1] === "text"){
            let split_text = msg_text.split(" ");
            if (split_text[2].startsWith("<@")) {
                let uid = split_text[2].substring(2, split_text[2].length - 1);
                const result = await slackClient.users.info({ user: uid });

                const slackname = result.user.profile.display_name;

                if (!(["daily", "weekly", "monthly", "alltime"].includes(split_text[3].toLowerCase()))) {
                    sendMessage(channel, "Tell me a reasonable timeframe");
                    return;
                }


                let data_buffer = await MyData(slackname, split_text[3].toLowerCase());

                if (data_buffer == null) {
                    sendMessage(channel, "[ -_- ] something went wrong");
                    return;
                }
                else{
                    sendMessage(channel, data_buffer)
                }



            }
            else if (split_text[2].startsWith("@")) {
                let tag = split_text[2].substring(1);

                if (!(["daily", "weekly", "monthly", "alltime"].includes(split_text[3].toLowerCase()))) {
                    sendMessage(channel, "Tell me a reasonable timeframe");
                    return;
                }

                let data_buffer = await TagData(tag, split_text[3].toLowerCase());
                if (data_buffer == null) {
                    sendMessage(channel, "[ -_- ] something went wrong");
                    return;
                }
                else{
                    sendMessage(channel, data_buffer)
                    return;

                }

            }

        }



        else {
            sendMessage(channel, `Who is that?`);
            return;
        }
    }
    else {
        sendMessage(channel, `kya bol rha hai bhai`);
        return;
    }


    // @Bot "labtime" "@username or tag" "daily/weekly/monthly/alltime-" 

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

