import pool from '../config/db.js'


export async function doMaintenance(){
        const initial = await pool.query(
            'SELECT * FROM members_info'
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
            const enrollNo = row['enrollment_num'];
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

            await pool.query(
                `UPDATE members_info
                SET labdata = $1
                WHERE enrollment_num = $2`,
                [labData, enrollNo]
            );



        }

}


export const setupLogs = async(req, res) =>{
    try{

        await doMaintenance();
        res.status(201).json({ 'message': 'Maintenance success'}    );


    }

    catch(e){
        console.log(e)
        res.status(500).json({ message: 'DB error in maintenance' });

    }
}
