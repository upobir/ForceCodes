function getProfileInnerNav(user, handle){
    let innerNav = [
        {url: `/profile/${handle}`, name: `${handle.toUpperCase()}`},
        {url: `/profile/${handle}/blog`, name: `BLOG`},
        {url: `/profile/${handle}/teams`, name: `TEAMS`},
        {url: `/profile/${handle}/submissions`, name: `SUBMISSIONS`},
        {url: `/profile/${handle}/problemsettting`, name: `PROBLEMSETTING`}
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
    return innerNav;
}

module.exports = {
    getProfileInnerNav,
    getContestInnerNav
}