export default function parseEventTime(message) {
  const lines = message.split('\n');
  const timeLine = lines.find(line => line.toLowerCase().startsWith('event time is'));

  if (!timeLine) return null;

  const timeStr = timeLine.substring('event time is'.length).trim(); 
  if (!timeStr) return null;

  const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{2}) (\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  const match = timeStr.match(dateTimeRegex);

  if (!match) return null;

  let [, day, month, year, hour, minute, meridiem] = match;

  day = parseInt(day, 10);
  month = parseInt(month, 10) - 1;
  year = parseInt(year, 10);
  hour = parseInt(hour, 10);
  minute = parseInt(minute, 10);

  year += (year < 50 ? 2000 : 1900);

  if (meridiem.toUpperCase() === 'PM' && hour < 12) {
    hour += 12;
  } else if (meridiem.toUpperCase() === 'AM' && hour === 12) {
    hour = 0;
  }

  const dateObj = new Date(Date.UTC(year, month, day, hour, minute));
  // console.log('Parsed date object:', dateObj);

  const utcTime = new Date(dateObj.getTime() - (5.5 * 60 * 60 * 1000));

  return utcTime.toISOString();
}

