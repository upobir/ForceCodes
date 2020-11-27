const DB_contests = require(process.env.ROOT+'/DB-codes/DB-contest-api');

async function getRightPanel(user){
    let panels = [];

    let contests = await DB_contests.getFutureContests();

    if(contests.length > 0){
        panels.push({
            file : 'contestAlert',
            title : contests[0].NAME,
            start : contests[0].TIME_START,
            duration : contests[0].DURATION,
            id : contests[0].ID
        })
    }

    panels.push({
        file : 'random'
    });

    return panels;
}

module.exports = {
    getRightPanel
}