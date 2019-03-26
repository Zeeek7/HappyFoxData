﻿// requires
const request = require('request-promise');
const pg = require('pg')
const auth = require('./auth.json');
const pgClient = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'happyfoxdata',
    password: `${auth.password}`,
    port: 5432,
});

const unassignedData = [];
var insertData = 'INSERT INTO unassignedtickets(timestamp, ticketcount) VALUES($1, $2) RETURNING *';

function timestamp() {
    var now = new Date();
    var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
    var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
    var suffix = (time[0] < 12) ? "AM" : "PM";
    time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
    time[0] = time[0] || 12;
    for (var i = 1; i < 3; i++) {
        if (time[i] < 10) {
            time[i] = "0" + time[i];
        }
    }
    return date.join("/") + " " + time.join(":") + " " + suffix;
}

// connect to psql

try {
    pgClient.connect();
    console.log('Successfully connected to database...')
} catch(err) {
    console.log('Error connecting to database')
}

// async block
async function update() {
    await getHappyFoxData()
}

// gets data every 30 seconds
async function init() {
    await update();
    setInterval(update, 30000);
};

(async () => {
    await init();
})()

// get Happy Fox Data
async function getHappyFoxData() {
    const requestOptions = {
        method: 'GET',
        uri: 'https://hertzcbo.happyfox.com/api/1.1/json/report/2/',
        headers: {
            authorization: `${auth.login}`
        },
        json: true,
    };
    try {
        var result = await request(requestOptions);
        // console.log(result);
        unassignedData[0] = timestamp();
        unassignedData[1] = result.ticket_count;
        pgClient.query(insertData, unassignedData, (err, res) => {
            if (err) {
                console.log(err.stack);
            } else {
                console.log(res.rows[0])
            }
        })

        // console.log(unassignedData);
        return result;
    } catch (err) {
        console.log('** Error:\n', err);
        return undefined;
    }
}
