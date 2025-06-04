export default function parseEmoji(message) {

  // I expect the user to type 'react with :emoji_name: to make the bot know about the reaction emoji name


  const lines = message.split('\n');
  const emojiLine = lines.find(line => line.toLowerCase().startsWith('react with '));

  const emojiStr = emojiLine.split('react with ')[1]?.trim();

  // const match = message.match(/react with\s*:(\w+):/i);
  return emojiStr;
}