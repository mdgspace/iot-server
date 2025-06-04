import pool from '../config/db.js';

export const addReaction = async ({ event_id, user_id, reaction }) => {
  const query = `
    INSERT INTO reactions (event_id, user_id, reaction)
    VALUES ($1, $2, $3);
  `;
  const values = [event_id, user_id, reaction];
  return pool.query(query, values);
};

export const getReactionsForEvent = async (event_id) => {
  const query = `SELECT * FROM reactions WHERE event_id = $1;`;
  return pool.query(query, [event_id]);
};

export const removeReaction = async({event_id, user_id, reaction}) => 
{
  const query = `
    DELETE FROM reactions 
    WHERE event_id = $1 AND user_id = $2 AND reaction = $3;
  `
  const values = [event_id, user_id, reaction];
  return pool.query(query, values);
}