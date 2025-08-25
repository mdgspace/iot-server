import pool from '../config/db.js'

const SAC_CLOSING_HOUR = 2.0
const SAC_OPENING_HOUR = 6.0


export const toggleInOut = async (req, res) => {
    const enroll_num = req.body['rollno'];
    var response_str = ""

    try {
        const initial = await pool.query(
            'SELECT * FROM members_info WHERE (enrollment_num)=($1)', [enroll_num]
        );

        let initStatus = initial.rows[0];


        if (initStatus == null){
            res.status(500).json({ 'status': 'User not found', 'labdata': labData });
            return;
        }
        var labData = initStatus['labdata'] // json

        if (labData == null) {
            labData = { "logs": [], "isInLab": false, "labTime": 0, "dayWise": {} }
        }

        let logs = labData["logs"] // format for logs: [ ['IN' or 'OUT' , 'iso time string'], ]
        let labTime = labData.labTime // float in hours
        let isInLab = labData.isInLab //bool


        var dayWiseData = labData['dayWise'] // like this: {'DATESTRING': float, 'DATESTRING2': float}

        let new_timestamp = new Date();



    // as a safeguard, we need to check if the last entry time was before 2 AM and the exit time is the next day, then that means there is faulty entry

        if (logs.length == 0) {
            let newlog = ['IN', new_timestamp.toISOString()]
            logs.push(newlog)
            response_str = "Toggle successful"
            isInLab = true

        }

        else {
            let last_log = logs[logs.length - 1]
            let old_timestamp = new Date(last_log[1]);

            const ddo = String(old_timestamp.getDate()).padStart(2, '0');
            const mmo = String(old_timestamp.getMonth() + 1).padStart(2, '0'); 
            const yyo = String(old_timestamp.getFullYear()).slice(-2);

            const oldDate = ddo + mmo + yyo;

            if (!(oldDate in dayWiseData)){
                dayWiseData[oldDate] = 0
            } 

            if (last_log[0] == "IN") {
                let old_timestamp = new Date(last_log[1]);

                let copy_new_timestamp = new Date(new_timestamp).setHours(0, 0, 0, 0)
                let copy_old_timestamp = new Date(old_timestamp).setHours(0, 0, 0, 0)

                let delta_days = Math.floor((copy_new_timestamp - copy_old_timestamp) / (1000 * 60 * 60 * 24))

                if (delta_days == 0) {
                    if (old_timestamp.getHours() <= SAC_CLOSING_HOUR && new_timestamp.getHours() >= SAC_OPENING_HOUR) {
                        // wrong entry
                        logs.splice(logs.length - 1, 1)
                        // still consider this entry to be valid input
                        let newlog = ['IN', new_timestamp.toISOString()]
                        logs.push(newlog)
                        // and there will be no difference in lab hours, as the previous in is invalid
                        response_str = "Invalid sequence of entries, previous entry discarded"
                        isInLab = true
                    }

                    else if (old_timestamp.getHours() > SAC_OPENING_HOUR) {
                        let newlog = ['OUT', new_timestamp.toISOString()]
                        logs.push(newlog)
                        let timedelta_hours = (new_timestamp - old_timestamp) / (1000 * 60 * 60)
                        labTime += timedelta_hours
                        dayWiseData[oldDate] += timedelta_hours

                        response_str = "Toggle successful"
                        isInLab = false
                    }
                    else if (old_timestamp.getHours() >=0 && new_timestamp.getHours() <= SAC_CLOSING_HOUR){
                        let newlog = ['OUT', new_timestamp.toISOString()]
                        logs.push(newlog)
                        // console.log("In here")
                        let timedelta_hours = (new_timestamp - old_timestamp) / (1000 * 60 * 60)
                        // console.log(timedelta_hours)
                        labTime += timedelta_hours
                        dayWiseData[oldDate] += timedelta_hours

                        response_str = "Toggle successful"
                        // console.log(labTime)
                        isInLab = false

                    }
                }
                else if (delta_days == 1) {
                    // if consecutive days
                    if (old_timestamp.getHours() >= SAC_OPENING_HOUR && new_timestamp.getHours() <= SAC_CLOSING_HOUR) {
                        let newlog = ['OUT', new_timestamp.toISOString()]
                        logs.push(newlog)
                        let timedelta_hours = (new_timestamp - old_timestamp) / (1000 * 60 * 60)
                        labTime += timedelta_hours
                        dayWiseData[oldDate] += timedelta_hours

                        response_str = "Toggle successful"
                        isInLab = false
                    }
                    else {
                        // invalid in all other cases
                        logs.splice(logs.length - 1, 1)
                        // still consider this entry to be valid input
                        let newlog = ['IN', new_timestamp.toISOString()]
                        logs.push(newlog)
                        // and there will be no difference in lab hours, as the previous in is invalid
                        response_str = "Invalid sequence of entries, previous entry discarded"
                        isInLab = true
                    }
                }

                else if (delta_days > 1) {
                    // if not consecutive days
                    // wrong entry
                    logs.splice(logs.length - 1, 1)
                    // still consider this entry to be valid input
                    let newlog = ['IN', new_timestamp.toISOString()]
                    logs.push(newlog)
                    // and there will be no difference in lab hours, as the previous in is invalid
                    response_str = "Invalid sequence of entries, previous entry discarded"
                    isInLab = true
                }
            }

            else if (last_log[0] == "OUT") {
                let newlog = ['IN', new_timestamp.toISOString()]
                logs.push(newlog)
                response_str = "Toggle successful"
                isInLab = true
            }

        }
        

        labData['logs'] = logs
        // console.log(labTime)
        labData['labTime'] = labTime
        labData['isInLab'] = isInLab
        labData['dayWise'] = dayWiseData



        const response = await pool.query(
            'UPDATE members_info SET labdata=($1) WHERE enrollment_num = ($2)', [labData, enroll_num]
        );


        res.status(201).json({ 'status': response_str, 'labdata': labData });
        console.log("reached here 6")

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error while updating DB' });
    }


}