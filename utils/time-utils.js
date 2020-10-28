const MINUTE = 60*1000;
const HOUR = 60*MINUTE;
const DAY = 24*HOUR;
const WEEK = 7*DAY;
const MONTH = 30*DAY;
const YEAR = 365*DAY;

function timeAgo(time){
    let interval = new Date() - time;
    if(interval < 2*MINUTE){
        return 'now';
    } else if(interval < HOUR) {
        return Math.floor(interval/MINUTE) + ' minutes';
    } else if(interval < DAY) {
        return Math.floor(interval/HOUR) + ' hours';
    } else if(interval < WEEK) {
        return Math.floor(interval/DAY) + ' days';
    } else if(interval < MONTH) {
        return Math.floor(interval/WEEK) + ' weeks';
    } else if(interval < YEAR) {
        return Math.floor(interval/MONTH) + ' months';
    } else{
        return Math.floor(interval/YEAR) + ' years';
    }
}

module.exports = {
    timeAgo
}