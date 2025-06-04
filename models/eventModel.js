import pool from '../config/db.js';

export const createEvent = async ({ message, channel, created_by, event_time, emoji, ts }) => {
  const query = `
    INSERT INTO events (message, channel, created_by, event_time, emoji, ts)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [message, channel, created_by, event_time, emoji, ts];
  return pool.query(query, values);
};

export const getEventByTimestamp = async (ts) => {
  const query = `SELECT * FROM events WHERE ts = $1 LIMIT 1;`;
  const result = await pool.query(query, [ts]);
  console.log(result.rows[0]);
  return result.rows[0];
};

export const getLatestEvent = async () => {
  const query = `SELECT * FROM events WHERE started = FALSE ORDER BY event_time ASC LIMIT 1`;
  const result = await pool.query(query);
  // console.log(result);
  return result.rows;
};

export const getAttendeeById = async (id) => {
  console.log(id);
  const result = await pool.query(
    'SELECT user_id FROM reactions WHERE event_id = $1;',
    [id]
  );
  console.log(result);
  return result.rows.map(row => row.user_id);
}

export const updateStartedFlag = async (id) => {
  const query = `UPDATE events SET started = true WHERE id = $1;`;
  return pool.query(query, [id]);
};