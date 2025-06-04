import * as chrono from 'chrono-node';

export default function parseEventTime(message) {

    // I am expecting the message to follow the following format:

    // Description of the entire event  \n

    // Event time is ------- \n

    // react with :emoji: to -----

    // The operations done below first split all lines into seperate lines by using the newline character.
    // Then we look for line which starts with the phrase 'event time is'
    // then I remove that phrase to find the time and then use chrono-node to parse the text into ISO time.
    
    // In slack, when one presses shift + enter, it inserts a newline character. So I expect users of the bot to go to a 
    // newline by using shift + enter and start with the phrase 'event time is' to let the bot do it's work.

  const lines = message.split('\n');
  const timeLine = lines.find(line => line.toLowerCase().startsWith('event time is'));

  if (!timeLine) return null;

  const timeStr = timeLine.toLowerCase().split('event time is')[1]?.trim();
  if (!timeStr) return null;

  const parsedDate = chrono.parseDate(timeStr);
  return parsedDate ? parsedDate.toISOString() : null;
}
