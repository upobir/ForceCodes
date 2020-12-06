function getProfileInnerNav(user, handle){
    let innerNav = [
        {url: `/profile/${handle}`, name: `${handle.toUpperCase()}`},
        {url: `/profile/${handle}/blog`, name: `BLOG`},
        {url: `/profile/${handle}/teams`, name: `TEAMS`},
        {url: `/profile/${handle}/submissions`, name: `SUBMISSIONS`},
        {url: `/profile/${handle}/problemsetting`, name: `PROBLEMSETTING`}
    ];
    if(user !== null && user.handle == handle){
        innerNav.splice(1, 0, {url: `/profile/${handle}/settings`, name: `SETTINGS`});
        innerNav.splice(2, 0, {url: `/profile/${handle}/friends`, name: `FRIENDS`});
    }
    return innerNav;
};

function getContestInnerNav(contest){
    let innerNav = [
        {url : `/contest/${contest.ID}`, name: 'PROBLEMS'},
        {url : `/contest/${contest.ID}/submit`, name: 'SUBMIT CODE'},
        {url : `/contest/${contest.ID}/submissions/my`, name: 'MY SUBMISSIONS'},
        {url : `/contest/${contest.ID}/submissions`, name: 'STATUS'},
        {url : `/contest/${contest.ID}/standing`, name: 'STANDINGS'},
    ];
    if(contest.IS_ADMIN){
        if(contest.TIME_START > Date.now()){
            innerNav[3].url = `/contest/${contest.ID}/register`;
            innerNav[3].name = 'REGISTERED';
        }
        innerNav.splice(3, 0, {url : `/contest/${contest.ID}/submissions/admin`, name : 'ADMIN SUBMISSIONS'});
    }
    return innerNav;
}

function getStandingsInnerNav(user, contestId){
    let innerNav = [
        {url : `/contest/${contestId}`, name: 'PROBLEMS'},
        {url : `/contest/${contestId}/standing`, name: 'STANDINGS'}
    ];

    if(user != null)
        innerNav.push({url : `/contest/${contestId}/standing/friends`, name: 'FRIEND STANDINGS'});
    return innerNav;
}

function getProblemsNav(){
    let innerNav = [
        {url : `/problems`, name: 'PROBLEMS'},
        {url : `/problems/status`, name: 'STATUS'}
    ]
    return innerNav;
}

module.exports = {
    getProfileInnerNav,
    getContestInnerNav,
    getStandingsInnerNav,
    getProblemsNav
}