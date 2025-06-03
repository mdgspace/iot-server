import pool from '../config/db.js';
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

dotenv.config();
const slackClient = new WebClient(process.env.EVENT_MANAGER_BOT_TOKEN);

const sendDMReminders = async () => {
    const now = new Date();

    const fifteenMinLater = new Date(now.getTime() + 15 * 60000).toISOString();
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60000).toISOString();

    try {
        // 1. Send reminders
        const { rows: upcomingEvents } = await pool.query(`
      SELECT * FROM events
      WHERE event_time <= $1 AND notified = FALSE
    `, [fifteenMinLater]);

        for (const event of upcomingEvents) {
            const { rows: reactions } = await pool.query(
                'SELECT user_id FROM reactions WHERE event_id = $1',
                [event.id]
            );

            const tsFormatted = event.ts.replace('.', '');
            const messageLink = `https://slack.com/archives/${event.channel}/p${tsFormatted}`;

            for (const reaction of reactions) {
                // console.log('Original UTC:', event.event_time);
                // console.log('Parsed Date:', new Date(event.event_time));
                const eventTimeIST = new Date(event.event_time).toLocaleTimeString();
                // console.log('IST Time:', eventTimeIST);
                const eventDateIST = new Date(event.event_time).toLocaleDateString();

                await slackClient.chat.postMessage({
                    channel: reaction.user_id,
                    text: `⏰ Reminder: You reacted to an event which was scheduled on ${eventDateIST} at ${eventTimeIST} IST.\n\nView the message: ${messageLink}`,
                });
            }

            await pool.query('UPDATE events SET notified = TRUE WHERE id = $1', [event.id]);
        }


        // 2. Delete old events
        await pool.query('DELETE FROM reactions WHERE event_id IN (SELECT id FROM events WHERE event_time <= $1)', [thirtyMinAgo]);
        await pool.query('DELETE FROM events WHERE event_time <= $1', [thirtyMinAgo]);

    } catch (err) {
        console.error('Scheduler Error:', err);
    }
};

export const startScheduler = () => {
    console.log('🔁 Scheduler running every 60 seconds...');
    setInterval(sendDMReminders, 60 * 1000);
};
