import pool from '../config/db.js'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import ChartDataLabels from 'chartjs-plugin-datalabels'



const width = 1760;
const height = 990;
const backgroundColour = 'white';
const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour,
    plugins: {
        modern: [ChartDataLabels]
    }
});

function get_date_str(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);

    return dd + mm + yy;
}

function formatDateStr(dateStr) {
    if (dateStr.length !== 6) throw new Error("Date string must be 6 digits (DDMMYY)");
    const day = dateStr.slice(0, 2);
    const month = dateStr.slice(2, 4);
    const year = dateStr.slice(4, 6);
    return `${day}/${month}/${year}`;
}


const singleBarColors = {
    background: 'rgba(99, 102, 241, 0.8)',
    border: 'rgba(99, 102, 241, 1)',
    gradient: ['rgba(99, 102, 241, 0.8)', 'rgba(139, 92, 246, 0.8)']
};

const multiBarColors = [
    'rgba(99, 102, 241, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 101, 101, 0.8)',
    'rgba(251, 191, 36, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(168, 85, 247, 0.8)'
];

const getBaseConfig = (type = 'bar') => ({
    type,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#374151',
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                cornerRadius: 8,
                padding: 12
            },
            datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#374151',
                font: {
                    size: 12,
                    weight: 'bold'
                },
                formatter: (value, context) => {
                    return value > 0 ? value : '';
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    color: '#6B7280',
                    maxRotation: 45
                },
                title: {
                    display: true,
                    text: 'Date',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#374151'
                }
            },
            y: {
                beginAtZero: true,
                suggestedMax: function (context) {
                    const max = Math.max(...context.chart.data.datasets.flatMap(d => d.data));
                    return max * 1.15;
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    lineWidth: 1
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    color: '#6B7280'
                },
                title: {
                    display: true,
                    text: 'Hours',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#374151'
                }
            }
        },
        layout: {
            padding: {
                top: 20,
                right: 30,
                bottom: 20,
                left: 30
            }
        }
    }
});

async function make_graph(config) {
    const image = await chartJSNodeCanvas.renderToBuffer(config);
    return image;
}


export async function MyData(myName, timeframe) {
    if (timeframe == 'alltime') {
        const initial = await pool.query(
            'SELECT labdata FROM members_info WHERE (slack_name)=($1)', [myName]
        );
        if (initial.rows.length == 0) {
            return null;
        }

        let labtime = initial.rows[0].labdata['labTime'];



        return `${myName}\'s overall labtime is ${labtime} hours`;
    }

    else if (timeframe == 'monthly') {
        const initial = await pool.query(
            'SELECT labdata FROM members_info WHERE (slack_name)=($1)', [myName]
        );
        if (initial.rows.length == 0) {
            return null;
        }

        let labData = initial.rows[0].labdata['dayWise'];

        let ret_str = `${myName}\'s labtimes this month are: \n`;

        for (let i = 29; i >= 0; i--) {
            let date = new Date();
            date.setDate(date.getDate() - i)
            let date_str = get_date_str(date);

            if (date_str in labData) {
                ret_str += formatDateStr(date_str) + ": " + labData[date_str] + " hours";
            } else {
                ret_str += formatDateStr(date_str) + ": " + 0 + " hours";
            }
            ret_str += '\n';
        }
        return ret_str;

    } else if (timeframe == 'weekly') {
        const initial = await pool.query(
            'SELECT labdata FROM members_info WHERE (slack_name)=($1)', [myName]
        );
        if (initial.rows.length == 0) {
            return null;
        }

        let labData = initial.rows[0].labdata['dayWise'];

        let ret_str = `${myName}\'s labtimes this week are: \n`;

        for (let i = 6; i >= 0; i--) {
            let date = new Date();
            date.setDate(date.getDate() - i)
            let date_str = get_date_str(date);

            if (date_str in labData) {
                ret_str += formatDateStr(date_str) + ": " + labData[date_str] + " hours";
            } else {
                ret_str += formatDateStr(date_str) + ": " + 0 + " hours";
            }
            ret_str += '\n';
        }

        return ret_str;

    } else if (timeframe == "daily") {
        const initial = await pool.query(
            'SELECT labdata FROM members_info WHERE (slack_name)=($1)', [myName]
        );
        if (initial.rows.length == 0) {
            return null;
        }

        let labData = initial.rows[0].labdata['dayWise'];

        var labtime = 0;

        let date_str = get_date_str(new Date());
        if (date_str in labData) {
            labtime = labData[date_str];
        }

        return `${myName}\'s labtime today has been ${labtime} hours`;
    }

    else {
        return null;
    }
}

export async function TagData(tag, timeframe) {
    if (timeframe == 'alltime') {
        const users = await pool.query(
            'SELECT * FROM members_info WHERE $1 = ANY(tags)', [tag]
        );
        if (users.rows.length == 0) {
            return null;
        }

        var ret_str = tag + '\'s labtimes are: \n';

        for (let row of users.rows) {
            if (row.labdata['labTime'] != undefined) {
                ret_str += row.slack_name + ": " + row.labdata['labTime'] + " hours" + '\n';
            } else {
                ret_str += row.slack_name + ": " + "0 hours" + '\n';
            }
        }

        return ret_str;
    }

    else if (timeframe == 'weekly') {
        const users = await pool.query(
            'SELECT * FROM members_info WHERE $1 = ANY(tags)', [tag]
        );
        if (users.rows.length == 0) {
            return null;
        }

        var ret_str = tag + '\'s labtimes in the last week are: \n';


        for (let i = 6; i >= 0; i--) {
            let date = new Date();
            date.setDate(date.getDate() - i)
            let date_str = get_date_str(date);
            ret_str += `\n*${formatDateStr(date_str)}-*\n`;

            for (let row of users.rows) {
                let initial = row.labdata['dayWise'];

                if (date_str in initial) {
                    ret_str += "• " + row.slack_name + "- " + initial[date_str] + " hours\n"
                } else {
                    ret_str += "• " + row.slack_name + "- " + 0 + " hours\n"
                }
            }
        }

        return ret_str;
    }
    else if (timeframe == 'monthly') {
        const users = await pool.query(
            'SELECT * FROM members_info WHERE $1 = ANY(tags)', [tag]
        );
        if (users.rows.length == 0) {
            return null;
        }

        var ret_str = tag + '\'s labtimes in the last month are: \n';


        for (let i = 29; i >= 0; i--) {
            let date = new Date();
            date.setDate(date.getDate() - i)
            let date_str = get_date_str(date);
            ret_str += `\n*${formatDateStr(date_str)}-*\n`;

            for (let row of users.rows) {
                let initial = row.labdata['dayWise'];

                if (date_str in initial) {
                    ret_str += "• " + row.slack_name + "- " + initial[date_str] + " hours\n"
                } else {
                    ret_str += "• " + row.slack_name + "- " + 0 + " hours\n"
                }
            }
        }

        return ret_str;
    }
    else if (timeframe == 'daily') {
        const users = await pool.query(
            'SELECT * FROM members_info WHERE $1 = ANY(tags)', [tag]
        );
        if (users.rows.length == 0) {
            return null;
        }

        var ret_str = tag + '\'s labtimes today have been: \n';


        let date_str = get_date_str(new Date());

        for (let row of users.rows) {
            let initial = row.labdata['dayWise'];

            if (date_str in initial) {
                ret_str += "• " + row.slack_name + "- " + initial[date_str] + " hours\n"
            } else {
                ret_str += "• " + row.slack_name + "- " + 0 + " hours\n"
            }
        }

        return ret_str;
    }
    else {
        return null;
    }

}
export async function MyChart(myName, timeframe) {
    if (timeframe == 'alltime') {
        const initial = await pool.query(
            'SELECT labdata FROM members_info WHERE (slack_name)=($1)', [myName]
        );
        if (initial.rows.length == 0) {
            return null;
        }

        let labtime = initial.rows[0].labdata['labTime'];

        let config = {
            ...getBaseConfig('bar'),
            data: {
                labels: ['All time'],
                datasets: [{
                    label: `${myName}'s overall lab hours`,
                    data: [labtime],
                    backgroundColor: singleBarColors.background,
                    borderColor: singleBarColors.border,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                    maxBarThickness: 120,
                    minBarLength: 2
                }]
            }
        };
        config.options.scales.x.title.text = 'Period';

        let graph = await make_graph(config);

        return graph;
    }


    else if (timeframe == 'monthly') {
        const initial = await pool.query(
            'SELECT labdata FROM members_info WHERE (slack_name)=($1)', [myName]
        );
        if (initial.rows.length == 0) {
            return null;
        }

        let labData = initial.rows[0].labdata['dayWise'];

        var labtimes = [];
        var dates = [];

        for (let i = 29; i >= 0; i--) {
            let date = new Date();
            date.setDate(date.getDate() - i)
            let date_str = get_date_str(date);

            dates.push(formatDateStr(date_str));
            if (date_str in labData) {
                labtimes.push(labData[date_str]);
            } else {
                labtimes.push(0);
            }
        }

        let config = {
            ...getBaseConfig('bar'),
            data: {
                labels: dates,
                datasets: [{
                    label: `${myName}'s lab hours of the last month`,
                    data: labtimes,
                    backgroundColor: singleBarColors.background,
                    borderColor: singleBarColors.border,
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                    maxBarThickness: 25,
                    minBarLength: 1
                }]
            }
        };

        let graph = await make_graph(config);
        return graph;

    } else if (timeframe == 'weekly') {
        const initial = await pool.query(
            'SELECT labdata FROM members_info WHERE (slack_name)=($1)', [myName]
        );
        if (initial.rows.length == 0) {
            return null;
        }

        let labData = initial.rows[0].labdata['dayWise'];

        var labtimes = [];
        var dates = [];

        for (let i = 6; i >= 0; i--) {
            let date = new Date();
            date.setDate(date.getDate() - i)
            let date_str = get_date_str(date);

            dates.push(formatDateStr(date_str));
            if (date_str in labData) {
                labtimes.push(labData[date_str]);
            } else {
                labtimes.push(0);
            }
        }

        let config = {
            ...getBaseConfig('bar'),
            data: {
                labels: dates,
                datasets: [{
                    label: `${myName}'s lab hours of the last week`,
                    data: labtimes,
                    backgroundColor: singleBarColors.background,
                    borderColor: singleBarColors.border,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                    maxBarThickness: 80,
                    minBarLength: 2
                }]
            }
        };

        let graph = await make_graph(config);
        return graph;

    } else if (timeframe == "daily") {
        const initial = await pool.query(
            'SELECT labdata FROM members_info WHERE (slack_name)=($1)', [myName]
        );
        if (initial.rows.length == 0) {
            return null;
        }

        let labData = initial.rows[0].labdata['dayWise'];

        var labtime = 0;

        let date_str = get_date_str(new Date());
        if (date_str in labData) {
            labtime = labData[date_str];
        }

        let config = {
            ...getBaseConfig('bar'),
            data: {
                labels: [formatDateStr(date_str)],
                datasets: [{
                    label: `${myName}'s lab time today`,
                    data: [labtime],
                    backgroundColor: singleBarColors.background,
                    borderColor: singleBarColors.border,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                    maxBarThickness: 80,
                    minBarLength: 2
                }]
            }
        };

        let graph = await make_graph(config);
        return graph;

    }

    else {
        return null;
    }

}

export async function TagChart(tag, timeframe) {
    if (timeframe == 'alltime') {
        const users = await pool.query(
            'SELECT * FROM members_info WHERE $1 = ANY(tags)', [tag]
        );
        if (users.rows.length == 0) {
            return null;
        }

        var labtimes = [];
        var names = [];
        var backgroundColors = [];
        var borderColors = [];

        for (let [index, row] of users.rows.entries()) {
            names.push(row.slack_name);
            if (row.labdata['labTime'] != undefined) {
                labtimes.push(row.labdata['labTime']);
            } else {
                labtimes.push(0);
            }
            backgroundColors.push(multiBarColors[index % multiBarColors.length]);
            borderColors.push(multiBarColors[index % multiBarColors.length].replace('0.8', '1'));
        }

        let config = {
            ...getBaseConfig('bar'),
            data: {
                labels: names,
                datasets: [{
                    label: `${tag}'s overall lab hours`,
                    data: labtimes,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false,
                    maxBarThickness: 60,
                    minBarLength: 2
                }]
            }
        };

        config.options.scales.x.title.text = 'Members';

        let graph = await make_graph(config);
        return graph;
    }
    else if (timeframe == 'weekly') {
        const users = await pool.query(
            'SELECT * FROM members_info WHERE $1 = ANY(tags)', [tag]
        );
        if (users.rows.length == 0) {
            return null;
        }

        let config = {
            ...getBaseConfig('bar'),
            data: {
                labels: [],
                datasets: []
            }
        };

        var dates = [];
        for (let i = 6; i >= 0; i--) {
            let date = new Date();
            date.setDate(date.getDate() - i)
            let date_str = get_date_str(date);

            dates.push(formatDateStr(date_str));
        }
        config.data.labels = dates;

        for (let [index, row] of users.rows.entries()) {
            let dataset = {
                label: row.slack_name,
                backgroundColor: multiBarColors[index % multiBarColors.length],
                borderColor: multiBarColors[index % multiBarColors.length].replace('0.8', '1'),
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
                maxBarThickness: 40,
                minBarLength: 1,
                data: []
            };

            let initial = row.labdata['dayWise'];

            for (let i = 6; i >= 0; i--) {
                let date = new Date();
                date.setDate(date.getDate() - i)
                let date_str = get_date_str(date);
                if (date_str in initial) {
                    dataset.data.push(initial[date_str]);
                } else {
                    dataset.data.push(0);
                }
            }
            config.data.datasets.push(dataset);
        }

        let graph = await make_graph(config);
        return graph;
    }
    else if (timeframe == 'monthly') {
        const users = await pool.query(
            'SELECT * FROM members_info WHERE $1 = ANY(tags)', [tag]
        );

        if (users.rows.length == 0) {
            res.status(400).json({ error: 'Bad Tag argument' });
        }

        let config = {
            ...getBaseConfig('bar'),
            data: {
                labels: [],
                datasets: []
            }
        };

        var dates = [];
        for (let i = 29; i >= 0; i--) {
            let date = new Date();
            date.setDate(date.getDate() - i)
            let date_str = get_date_str(date);

            dates.push(formatDateStr(date_str));
        }
        config.data.labels = dates;

        for (let [index, row] of users.rows.entries()) {
            let dataset = {
                label: row.slack_name,
                backgroundColor: multiBarColors[index % multiBarColors.length],
                borderColor: multiBarColors[index % multiBarColors.length].replace('0.8', '1'),
                borderWidth: 1,
                borderRadius: 3,
                borderSkipped: false,
                maxBarThickness: 20,
                minBarLength: 1,
                data: []
            };

            let initial = row.labdata['dayWise'];

            for (let i = 29; i >= 0; i--) {
                let date = new Date();
                date.setDate(date.getDate() - i)
                let date_str = get_date_str(date);
                if (date_str in initial) {
                    dataset.data.push(initial[date_str]);
                } else {
                    dataset.data.push(0);
                }
            }
            config.data.datasets.push(dataset);
        }
        let graph = await make_graph(config);
        return graph;

    }
    else if (timeframe == 'daily') {
        const users = await pool.query(
            'SELECT * FROM members_info WHERE $1 = ANY(tags)', [tag]
        );
        if (users.rows.length == 0) {
            return null;
        }

        let config = {
            ...getBaseConfig('bar'),
            data: {
                labels: [],
                datasets: []
            }
        };

        let date_str = [get_date_str(new Date())];


        for (let [index, row] of users.rows.entries()) {
            let dataset = {
                label: row.slack_name,
                backgroundColor: multiBarColors[index % multiBarColors.length],
                borderColor: multiBarColors[index % multiBarColors.length].replace('0.8', '1'),
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false,
                maxBarThickness: 40,
                minBarLength: 1,
                data: []
            };

            let initial = row.labdata['dayWise'];

            if (date_str in initial) {
                dataset.data.push(initial[date_str]);
            } else {
                dataset.data.push(0);
            }

            config.data.datasets.push(dataset);
        }

        config.data.labels = [formatDateStr(date_str)];

        let graph = await make_graph(config);
        return graph;
    }
    else {
        return null;
    }

}