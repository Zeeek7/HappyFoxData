// requires
const request = require('request-promise');
const auth = require('./auth.json');

const Globals = {
    "timeStamp": undefined,
    "ticketCount": undefined
}

function timeStamp() {
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
        console.log(result);
        Globals.ticketCount = result.ticket_count;
        Globals.timeStamp = timeStamp();
        console.log(Globals);
        return result;
    } catch (err) {
        console.log('** Error:\n', err);
        return undefined;
    }
}
