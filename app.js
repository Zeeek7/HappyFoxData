// Copyright (C) 2019, Connor McLeod
//
// Please see the included LICENSE file for more information.

// requires
const request = require('request-promise');
const pg = require('pg');
const config = require('./config.json');

// database configuration (change password in auth.json)
const pgClient = new pg.Client({
    user: `${config.psqlUser}`,
    host: `${config.psqlIP}`,
    database: `${config.psqlDBName}`,
    password: `${config.psqlPassword}`,
    port: `${config.psqlPort}`,
});

// pretty print a timestamp
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

// call functions
async function update() {
    await getHappyFoxData(`json/report/31/`, `vrstickets`);
    await getHappyFoxData(`json/report/31/`, `mainttickets`);
    await getHappyFoxData(`json/report/32/`, `logontickets`);
}

// gets data every 5 minutes
async function init() {
    await update();
    setInterval(update, 300000);
};

(async () => {
    await init();
})()

// get happyfox report data
async function getHappyFoxData(report, tablename) {
    const requestOptions = {
        method: 'GET',
        uri: `${config.happyfoxBaseURI}${report}`,
        headers: {
            authorization: `${config.happyfoxKey}`
        },
        json: true,
    };
    try {
        const fetchedData = [];
        var result = await request(requestOptions);
        // console.log(result);
        fetchedData[0] = timestamp();
        fetchedData[1] = result.ticket_count;
        pgClient.query(`INSERT INTO ${tablename}(timestamp, ticketcount) VALUES($1, $2) RETURNING *`, fetchedData, (err, res) => {
            if (err) {
                console.log(err.stack);
            } else {
                console.log(`Stored in database in table ${tablename}:\n`, res.rows[0]);
                console.log(result);
            }
        })
        return result;
    } catch (err) {
        console.log('** Error:\n', err);
        return undefined;
    }
}
