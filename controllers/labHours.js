import { response } from 'express';
import pool from '../config/db.js'

const SAC_CLOSING_HOUR = 2
const SAC_OPENING_HOUR = 6


export const toggleInOut = async (req, res) => {
    const {enroll_num} = req.body['rollno'];
    var response_str = ""

    try{
        const initial = await pool.query(
            'SELECT * FROM activeUsers WHERE (enroll_num)=($1)', [enroll_num]
        );

        let initStatus = json(initial.rows[0]);

        let logs = initStatus['logs'] // format for logs: [ ['IN' or 'OUT' : 'iso time string'], ]
        let labTime = initStatus['labTime'] // float in hours

        let last_log = logs[logs.length -1]
    
        // as a safeguard, we need to check if the last entry time was before 2 AM and the exit time is the next day, then that means there is faulty entry

        if (last_log[0] == "IN"){
            let new_timestamp = new Date();
            let old_timestamp = new Date(last_log[1]);

            let copy_new_timestamp = new Date(new_timestamp).setHours(0,0,0,0)
            let copy_old_timestamp = new Date(old_timestamp).setHours(0,0,0,0)

            let delta_days = Math.floor((copy_new_timestamp - copy_old_timestamp) / (1000*60*60*24))
            
            if(delta_days == 0){
                if (old_timestamp.getHours() <= SAC_CLOSING_HOUR && new_timestamp.getHours() >= SAC_OPENING_HOUR){
                    // wrong entry
                    logs.splice(logs.length -1, 1) 
                    // still consider this entry to be valid input
                    let newlog = ['IN', new_timestamp.toISOString()]
                    logs.push(newlog)
                    // and there will be no difference in lab hours, as the previous in is invalid
                    response_str = "Invalid sequence of entries, previous entry discarded"

                }
                else if (old_timestamp.getHours() > SAC_OPENING_HOUR) {
                    let newlog = ['OUT', new_timestamp.toISOString()]
                    logs.push(newlog)
                    let timedelta_hours = (new_timestamp - old_timestamp)/(1000*60*60)
                    labTime += timedelta_hours
                    response_str = "Toggle successful"
                }
            }
            else if (delta_days == 1){
                // if consecutive days
                if (old_timestamp.getHours() >= SAC_OPENING_HOUR && new_timestamp.getHours()<=SAC_CLOSING_HOUR){
                    let newlog = ['OUT', new_timestamp.toISOString()]
                    logs.push(newlog)
                    let timedelta_hours = (new_timestamp - old_timestamp)/(1000*60*60)
                    labTime += timedelta_hours
                    response_str = "Toggle successful"
                }
                else{
                    // invalid in all other cases
                    logs.splice(logs.length -1, 1) 
                    // still consider this entry to be valid input
                    let newlog = ['IN', new_timestamp.toISOString()]
                    logs.push(newlog)
                    // and there will be no difference in lab hours, as the previous in is invalid
                    response_str = "Invalid sequence of entries, previous entry discarded"
                }
            }

            else if (delta_days > 1){
                // if not consecutive days
                // wrong entry
                logs.splice(logs.length -1, 1) 
                // still consider this entry to be valid input
                let newlog = ['IN', new_timestamp.toISOString()]
                logs.push(newlog)
                // and there will be no difference in lab hours, as the previous in is invalid
                response_str = "Invalid sequence of entries, previous entry discarded"

            }


        }

        else if (last_log[0] == "OUT"){
            let newlog = ['IN', new_timestamp.toISOString()]
            logs.push(newlog)

            response_str = "Toggle successful"
        }

        const response = await pool.query(
            'UPDATE activeUsers SET (logs)=($1), (labTime)=($2) WHERE (id) = ($3)', [logs, labTime, enroll_num]
        );
        

        res.status(201).json({'status': response_str, 'newLabTime': labTime, 'newLogs': logs});
        
    }catch(err) {
        console.log(err);
        res.status(500).json({message: 'Server error while updating DB'});
    }


}