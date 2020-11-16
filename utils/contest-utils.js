

async function processContest(body, contest, errors){
    contest.title = body.title;
    contest.start = new Date(body.start);
    if(contest.start < new Date()){
        errors.push('Invalid start time');
    }

    let re = /^[0-9]+:[0-9]+$/;
    if(re.test(body.duration)){
        let tmp = body.duration.split(':');
        tmp[0] = parseInt(tmp[0]);
        tmp[1] = parseInt(tmp[1]);
        if(tmp[1] >= 60 || (tmp[1] == 0 && tmp[0] == 0)){
            errors.push('Invalid duration');
        }
        else{
            contest.duration = tmp[0]*60+tmp[1];
        }
    }
    else{
        errors.push('Invalid duration');
    }

    if(body.min_rating == '' && body.max_rating == ''){
        contest.min_rating = null;
        contest.max_rating = null;
    }
    else{
        contest.min_rating = (body.min_rating == '')? 0 : parseInt(body.min_rating);
        contest.max_rating = (body.max_rating == '')? 999999 : parseInt(body.max_rating);
        if(contest.min_rating > contest.max_rating){
            errors.push('Rating range is invalid')
        }
    }
    
    contest.admins = body.admins.split(',').filter(x => x!='');
}

module.exports = {
    processContest
}