// requires
const request = require('request-promise');
const pg = require('pg');
const auth = require('./auth.json');

// database configuration (change password in auth.json)
const pgClient = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'happyfoxdata',
    password: `${auth.password}`,
    port: 5432,
});

// function to pretty print a timestamp
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
    await getHappyFoxData(30, `vrstickets`);
    await getHappyFoxData(31, `mainttickets`);
    await getHappyFoxData(32, `logontickets`);
}

// gets data every 30 seconds
async function init() {
    await update();
    setInterval(update, 300000);
};

(async () => {
    await init();
})()

// get Happy Fox Data
async function getHappyFoxData(report, tablename) {
    const requestOptions = {
        method: 'GET',
        uri: `https://hertzcbo.happyfox.com/api/1.1/json/report/${report}/`,
        headers: {
            authorization: `${auth.login}`
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
                console.log(`Stored in database in table ${tablename}:\n`, res.rows[0])
            }
        })
        return result;
    } catch (err) {
        console.log('** Error:\n', err);
        return undefined;
    }
}
