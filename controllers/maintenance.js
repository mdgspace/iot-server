import pool from '../config/db.js'

export const setupLogs = async(req, res) =>{
    try{
        const initial = await pool.query(
            'SELECT * FROM activeUsers'
        );



        let date = new Date();

        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0'); 
        const yy = String(date.getFullYear()).slice(-2);

        const datestr = dd + mm + yy;


        const values = [];
        const placeholders = [];

        for (let i = 0; i < initial.rows.length; i++) {
            const row = initial.rows[i];
            const enrollNo = row['enroll_num'];
            let labData = row['labdata'];

            if (labData == null) {
                labData = { 'logs': [], 'isInLab': false, 'labTime': 0, 'dayWise': {} };
            }

            if (!(datestr in labData.dayWise)) {
                labData.dayWise[datestr] = 0;
            }

            values.push(enrollNo, JSON.stringify(labData));
            const idx = i * 2;
            placeholders.push(`($${idx + 1}, $${idx + 2})`);
        }

        await pool.query('TRUNCATE TABLE activeUsers');

        const query = `INSERT INTO activeUsers (enroll_num, labdata) VALUES ${placeholders.join(', ')}`;
        await pool.query(query, values);


        res.status(201).json({ 'message': 'Maintenance success'}    );


    }

    catch(e){
        console.log(e)
        res.status(500).json({ message: 'DB error in maintenance' });

    }
}