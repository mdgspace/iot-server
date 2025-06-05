import { parentPort, workerData } from 'node:worker_threads';

var lastDate = 0;
// const INTERVAL = 36000000 // 10 hours
const INTERVAL = 1000 // 10 hours

setInterval(
    ()=>{
        let date = new Date().getDate();

        if (date != lastDate){
            parentPort.postMessage('do');
            lastDate = date;
            console.log("done")
        }

    },
    INTERVAL
)