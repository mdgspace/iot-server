import pool from "../config/db.js";
export const addHolder = async (req, res) => {
    console.log(req.body);
    const { enroll_num } = req.body;
    const enroll_num_str = enroll_num.toString();
    const yearPrefix = enroll_num_str.substring(0, 2);

    try {
        const doesExist = await pool.query(
            'SELECT * FROM keyHolders WHERE CAST(enrollment_num AS TEXT) ~ $1',
            [`^${yearPrefix}`]
        );

        if (doesExist && doesExist.rowCount > 0) {
            await pool.query(
                'DELETE FROM keyHolders WHERE CAST(enrollment_num AS TEXT) ~ $1',
                [`^${yearPrefix}`]
            );
        }
        const memberDetails = await pool.query(
            'SELECT slack_name, enrollment_num, bhawan FROM members_info WHERE enrollment_num = $1',
            [enroll_num]
        );

        if (memberDetails.rowCount === 0) {
            return res.status(404).json({ message: 'Enrollment number not found in members_info' });
        }

        const { slack_name, enrollment_num, bhawan } = memberDetails.rows[0];

        const result = await pool.query(
            'INSERT INTO keyHolders (slack_name, enrollment_num, bhawan) VALUES ($1, $2, $3) RETURNING *',
            [slack_name, enrollment_num, bhawan]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error while creating keyHolder' });
    }
};


export const getAllHolders = async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM keyHolders');

        if(result.rows.length === 0) return res.status(404).send('no keyHolder found');
        // console.log(blog);
        res.send(result);
    }catch(err){
        console.log(err);
    }
}
