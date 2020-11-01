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

module.exports = {
    getProfileInnerNav
}