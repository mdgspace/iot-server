import pool from "../config/db.js";

export const addHolder = async (req, res) => {
    const {enroll_num} = req.body;
    // console.log(head);
    console.log(req.body);
    try{
        const result = await pool.query(
            'INSERT INTO activeUsers (enroll_num) VALUES ($1) RETURNING *', [enroll_num]
        );

        res.status(201).json(result.rows[0]);
    }catch(err) {
        console.log(err);
        res.status(500).json({message: 'Server error while creating keyHolder'});
    }
}

export const getAllHolders = async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM activeUsers');

        if(result.rows.length === 0) return res.status(404).send('no keyHolder found');
        // console.log(blog);
        res.send(result);
    }catch(err){
        console.log(err);
    }
}
