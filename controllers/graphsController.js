import {MyChart, TagChart} from '../services/graphs.js'


export const myGraph = async (req, res) => {
    const myName = req.params.slackname;
    const timeframe = req.params.timeframe;

    let graph = await MyChart(myName, timeframe);

    if (graph == null){
        res.status(400).json({ error: 'Bad arguments' });
        return;
    }
    res.type('image/png');
    res.send(graph);

}


export const graphByTag = async (req, res) => {
    const tag = req.params.tag;
    const timeframe = req.params.timeframe;

    let graph = await TagChart(tag, timeframe);
    
    if (graph == null){
        res.status(400).json({ error: 'Bad arguments' });
        return;
    }
    res.type('image/png');
    res.send(graph);

}

