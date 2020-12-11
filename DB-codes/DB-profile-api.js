const database = require('./database');

async function isHandleValid(handle){
    let sql = `
        SELECT
            COUNT(*) "COUNT"
        FROM
            USER_CONTESTANT_VIEW
        WHERE
            HANDLE = :handle
    `;
    let binds = {
        handle : handle
    };
    return (await database.execute(sql, binds, database.options)).rows[0].COUNT > 0;
}

async function getProfileByHandle(handle){
    let sql = `
        SELECT
            U.ID,
            U.HANDLE,
            U.EMAIL,
            U.PICTURE,
            R.COLOR,
            R.NAME "RANK_NAME",
            U.RATING,
            U.FIRST_NAME || ' ' || U.LAST_NAME "NAME",
            C.NAME "CITY",
            CO.NAME "COUNTRY",
            O.NAME "ORGANIZATION",
            NVL(FRIEND_COUNT, 0) "FRIEND_COUNT",
            LOGIN_TIME,
            CREATION_TIME,
            NVL(B.BLOG_COUNT, 0) "BLOG_COUNT"
        FROM
            USER_CONTESTANT_VIEW "U" JOIN
            RANK "R" ON (U.RANK_ID = R.ID) LEFT JOIN
            CITY "C" ON (U.CITY_ID = C.ID AND U.COUNTRY_ID = C.COUNTRY_ID) LEFT JOIN
            COUNTRY "CO" ON (U.COUNTRY_ID = CO.ID) LEFT JOIN
            ORGANIZATION "O" ON (U.ORG_ID = O.ID) LEFT JOIN
            (
                SELECT
                    AUTHOR_ID,
                    COUNT(*) "BLOG_COUNT"
                FROM
                    BLOG_POST
                GROUP BY
                    AUTHOR_ID
            ) "B" ON (B.AUTHOR_ID = U.ID) LEFT JOIN
            (
                SELECT
                    FOLLOWED_ID,
                    COUNT(*) "FRIEND_COUNT"
                FROM
                    USER_USER_FOLLOW
                GROUP BY
                    FOLLOWED_ID
            ) "F" ON (F.FOLLOWED_ID = U.ID)
        WHERE
            HANDLE = :handle
    `;
    let binds = {
        handle: handle
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function isFriendOfId(checkId, id){
    let sql = `
        SELECT
            *
        FROM
            USER_USER_FOLLOW
        WHERE
            FOLLOWER_ID = :id AND
            FOLLOWED_ID = :checkId
    `;
    let binds = {
        id : id,
        checkId : checkId
    }
    let results = (await database.execute(sql, binds, database.options));
    return results.rows.length > 0;
}

async function addFriendByHandle(id, handle){
    let sql = `
        INSERT INTO
            USER_USER_FOLLOW(
                FOLLOWER_ID,
                FOLLOWED_ID
            )
        SELECT
            :id,
            ID
        FROM
            USER_CONTESTANT_VIEW
        WHERE
            HANDLE = :handle
    `;
    let binds ={
        id : id,
        handle : handle
    }
    await database.execute(sql, binds, database.options);
    return;
}

async function removeFriendByHandle(id, handle){
    let sql = `
        DELETE FROM
            USER_USER_FOLLOW
        WHERE
            FOLLOWER_ID = :id AND
            FOLLOWED_ID = (
                SELECT 
                    ID
                FROM
                    USER_CONTESTANT_VIEW
                WHERE
                    HANDLE = :handle
            )
    `;
    let binds ={
        id : id,
        handle : handle
    }
    await database.execute(sql, binds, database.options);
    return;
}

async function getSettingsInfo(id){
    let sql = `
        SELECT
            U.EMAIL,
            U.FIRST_NAME,
            U.LAST_NAME,
            U.PICTURE,
            U.DATE_OF_BIRTH,
            CO.NAME "COUNTRY",
            CI.NAME "CITY",
            O.NAME "ORGANIZATION"
        FROM
            USER_CONTESTANT_VIEW "U" LEFT JOIN
            COUNTRY "CO" ON (U.COUNTRY_ID = CO.ID) LEFT JOIN
            CITY "CI" ON (U.CITY_ID = CI.ID) LEFT JOIN
            ORGANIZATION "O" ON (U.ORG_ID = O.ID)
        WHERE
            U.ID = :id
    `;
    let binds = {
        id : id
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getPasswordById(id){
    let sql = `
        SELECT
            PASSWORD
        FROM
            USER_ACCOUNT
        WHERE
            ID = :id
    `;
    let binds = {
        id : id
    }
    return (await database.execute(sql, binds, database.options)).rows;
}

async function updatePasswordById(id, password){
    let sql = `
        UPDATE
            USER_ACCOUNT
        SET
            PASSWORD = :password
        WHERE
            ID = :id
    `;
    let binds = {
        id : id,
        password : password
    };
    await database.execute(sql, binds, database.options);
    return;
}

async function updateSettingsById(id, info){
    let sql = `
        BEGIN
            UPDATE_SETTINGS(:id, :email, :fn, :ln, :dob, :cntry, :city, :org);
        END;
    `;

    let binds = {
        id : id,
        email : info.email,
        fn : info.firstName,
        ln : info.lastName,
        dob : info.birthdate,
        cntry : info.country,
        city : info.city,
        org : info.organization
    }
    await database.execute(sql, binds, {});
    return;
}

async function changePictureById(id, url){
    let sql = `
        SELECT
            PICTURE
        FROM
            USER_ACCOUNT
        WHERE
            ID = :id
    `;
    let binds = {
        id : id
    };
    const oldUrl = (await database.execute(sql, binds, database.options)).rows[0].PICTURE;
    sql = `
        UPDATE
            USER_ACCOUNT
        SET
            PICTURE = :url
        WHERE
            ID = :id
    `;
    binds = {
        id : id,
        url : url
    }
    await database.execute(sql, binds, database.options);
    return oldUrl;
}

async function updateAdminship(handle){
    const sql = `
        BEGIN
            UPDATE_ADMINSHIP(:handle);
        END;
    `;
    const binds = {
        handle : handle
    }
    await database.execute(sql, binds, database.options);
    return;
}

async function getTeamsById(id){
    let sql = `
        SELECT
            C.ID,
            C.HANDLE "NAME"
        FROM
            CONTESTANT "C" JOIN
            USER_TEAM_MEMBER "U" ON (C.ID = U.TEAM_ID)
        WHERE
            U.USER_ID = :id
    `;
    let binds = {
        id : id
    }
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getAdminnedContests(handle){
    let sql = `
        SELECT
            C.ID,
            C.NAME,
            C.TIME_START, 
            C.DURATION,
            NVL(R.PART_CNT, 0) "PART_CNT"
        FROM
            CONTEST "C" LEFT JOIN
            (
                SELECT 
                    CONTEST_ID,
                    COUNT(*) "PART_CNT"
                FROM
                    CONTEST_REGISTRATION
                WHERE
                    STANDING IS NOT NULL
                GROUP BY
                    CONTEST_ID
            ) "R" ON (R.CONTEST_ID = C.ID) JOIN
            USER_CONTEST_ADMIN "A" ON (A.CONTEST_ID = C.ID) JOIN
            CONTESTANT "CN" ON (CN.ID = A.USER_ID)
        WHERE 
            TIME_START + NUMTODSINTERVAL(DURATION, 'MINUTE') < SYSDATE AND
            CN.HANDLE = :handle
        ORDER BY
            TIME_START DESC
    `;
    let binds = {
        handle : handle
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function getSubmissionsByHandle(handle){
    let sql = `
        SELECT
            S.*
        FROM
            SUBMISSIONS_VIEW "S" JOIN
            CONTESTANT "C" ON (C.ID = S.AUTHOR_ID)
        WHERE
            S.TYPE <> 'ADMIN' AND (
                C.HANDLE = :handle OR
                EXISTS (
                    SELECT
                        *
                    FROM
                        USER_TEAM_MEMBER "M" JOIN
                        CONTESTANT "C2" ON (M.USER_ID = C2.ID)
                    WHERE
                        M.TEAM_ID = S.AUTHOR_ID AND
                        C2.HANDLE = :handle
                )
            )
        ORDER BY
            S.ID DESC
    `;
    let binds = {
        handle : handle
    };
    return (await database.execute(sql, binds, database.options)).rows;
}

async function createTeam(name, members){
    let sql = `
        BEGIN
            CREATE_TEAM(
                :id,
                :name
            );
        END;
    `;
    let binds = {
        id: {
            dir: oracledb.BIND_OUT, 
            type: oracledb.NUMBER
        },
        name: name
    };
    let result = (await database.execute(sql, binds, {})).outBinds;
    let teamId = result.id;
    console.log(teamId)

    sql = `
            INSERT INTO
                USER_TEAM_MEMBER(
                    USER_ID,
                    TEAM_ID,
                    TYPE
                )
            SELECT
                ID,
                :teamId,
                :type
            FROM
                CONTESTANT
            WHERE
                HANDLE = :handle
    `;

    binds = [];
    for(let i = 0; i<members.length; i++){
        binds.push({
            handle : members[i],
            teamId : teamId,
            type : (i == 0)? 'CREATOR' : 'MEMBER'
        });
    }
    await database.executeMany(sql, binds, {});
    return teamId;
}

async function getTeamsByHandle(handle){
    let sql = `
        SELECT
            *
        FROM
            CONTESTANT "CN"
        WHERE
            CN.TYPE = 'TEAM' AND
            EXISTS(
                SELECT
                    *
                FROM
                    USER_TEAM_MEMBER "M" JOIN
                    CONTESTANT "U" ON (U.ID = M.USER_ID)
                WHERE
                    U.HANDLE = :handle AND
                    M.TEAM_ID = CN.ID
            )
        ORDER BY
            CN.CREATION_TIME DESC
    `;
    let binds = {
        handle : handle
    };

    let results = (await database.execute(sql, binds, database.options)).rows;

    sql = `
        SELECT
            M.TEAM_ID,
            M.USER_ID,
            U.HANDLE,
            U.COLOR
        FROM
            USER_TEAM_MEMBER "M" JOIN
            USER_LIST_VIEW "U" ON (M.USER_ID = U.ID)
        WHERE
            EXISTS(
                SELECT
                    *
                FROM
                    USER_TEAM_MEMBER "M2" JOIN
                    CONTESTANT "CN" ON (CN.ID = M2.USER_ID)
                WHERE
                    CN.HANDLE = :handle AND
                    M2.TEAM_ID = M.TEAM_ID
            )
    `;
    binds = {
        handle : handle
    };

    let members = (await database.execute(sql, binds, database.options)).rows;
    
    let teamMap = {};
    results.forEach(team =>{
        teamMap[team.ID] = team;
        team.members = [];
    });

    members.forEach(member =>{
        teamMap[member.TEAM_ID].members.push(member);
    })

    return results;
}

async function getTeam(teamId){
    let sql = `
        SELECT
            *
        FROM
            CONTESTANT
        WHERE
            TYPE = 'TEAM' AND
            ID = :teamId
    `;
    let binds = {
        teamId : teamId
    };
    let results = (await database.execute(sql, binds, database.options)).rows;
    if(results.length == 0) return null;

    sql = `
        SELECT
            M.TYPE,
            U.HANDLE,
            U.COLOR
        FROM
            USER_TEAM_MEMBER "M" JOIN
            USER_LIST_VIEW "U" ON (M.USER_ID = U.ID)
        WHERE
            M.TEAM_ID = :teamId
        ORDER BY
            M.TYPE
    `;
    results[0].MEMBERS = (await database.execute(sql, binds, database.options)).rows;
    return results[0];
}

async function addTeamMember(team, handle){
    let sql = `
        BEGIN
            ADD_TEAM_MEMBER(
                :teamId,
                :handle,
                :memberId
            );
        END;
    `;
    let binds = {
        teamId : team,
        handle : handle,
        memberId : {
            dir: oracledb.BIND_OUT, 
            type: oracledb.NUMBER
        }
    };
    let result = (await database.execute(sql, binds, {})).outBinds.memberId;
    return result;
}

async function removeTeamMember(team, handle){
    let sql = `
        DELETE FROM
            USER_TEAM_MEMBER
        WHERE
            TYPE = 'MEMBER' AND
            TEAM_ID = :teamId AND
            USER_ID = (
                SELECT
                    ID
                FROM
                    CONTESTANT
                WHERE
                    HANDLE = :handle
            )
    `
    let binds = {
        teamId : team,
        handle : handle
    };
    await database.execute(sql, binds, {});
}

module.exports = {
    getProfileByHandle,
    isFriendOfId,
    addFriendByHandle,
    removeFriendByHandle,
    isHandleValid,
    getSettingsInfo,
    updatePasswordById,
    getPasswordById,
    updateSettingsById,
    changePictureById,
    updateAdminship,
    getTeamsById,
    getAdminnedContests,
    getSubmissionsByHandle,
    createTeam,
    getTeamsByHandle,
    getTeam,
    addTeamMember,
    removeTeamMember
}