const MINUTE = 60*1000;
const HOUR = 60*MINUTE;
const DAY = 24*HOUR;
const WEEK = 7*DAY;
const MONTH = 30*DAY;
const YEAR = 365*DAY;

function timeAgo(time){
    let interval = (new Date() > time)? (new Date() - time) : (time - new Date());
    if(interval < MINUTE){
        return 'now';
    } else if(interval < HOUR) {
        let x = Math.floor(interval/MINUTE)
        return x + ' minute' + (x > 1? 's' : '');
    } else if(interval < DAY) {
        let x = Math.floor(interval/HOUR); 
        return x  + ' hour' + (x > 1? 's' : '');
    } else if(interval < WEEK) {
        let x = Math.floor(interval/DAY);
        return x + ' day' + (x > 1? 's' : '');
    } else if(interval < MONTH) {
        let x = Math.floor(interval/WEEK);
        return x + ' week' + (x > 1? 's' : '');
    } else if(interval < YEAR) {
        let x = Math.floor(interval/MONTH);
        return x + ' month' + (x > 1? 's' : '');
    } else{
        let x = Math.floor(interval/YEAR);
        return x + ' year' + (x > 1? 's' : '');
    }
}

module.exports = {
    timeAgo
}