# Schema List

**REMINDER: Some id's will need to be removed**

- [x] ORGANIZATION (<u>id</u>, name)

- [x] COUNTRY (<u>id</u>, name)

- [x] CITY (<u>id</u>, name, <u>country_id</u>)

- [x] LANGUAGE (<u>id</u>, name, command)

- [x] TAG (<u>id</u>, name, type)

- [x] RANK (<U>id</u>, name, color, min_rating, max_rating, division)

- [x] CONTESTANT (<u>id</u>, type, handle, creation_time)

- [x] TEAM (<u>id</u>, description)

- [x] USER_ACCOUNT (<u>id</u>, first_name, last_name, password, email, rating, <u>rank_id</u>, login_time, picture, date_of_birth, <u>org_id</u>, <u>country_id</u>, <u>city_id</u>)

- [x] MESSAGE (<u>id</u>, body, time_sent, time_read, <u>from_user_id</u>, <u>to_user_id</u>)

- [x] CONTEST (<u>id</u>, name, time_start, duration, min_rated, max_rated)

- [ ] BLOG_POST (<u>id</u>, title, body, creation_time, <u>contest_id</u>, <u>author_id</u>)

- [ ] COMMENT (<u>id</u>, body, creation_time, <u>author_id</u>, <u>blog_id</u>, <u>parent_id</u>)

- [ ] PROBLEM (<u>id</u>, name, <u>contest_id</u>, body, source_limit, time_limit, memory_limit, rating)

- [ ] TEST_FILE (<u>id</u>, <u>problem_id</u>, type, input, output)

- [ ] SUBMISSION (<u>id</u>, <u>problem_id</u>, <u>author_id</u>, submission_time, judge_time, <u>lang_id</u>)

- [ ] USER_USER_FOLLOW (<u>id</u>, <u>follower_id</u>, <u>followed_id</u>)

- [ ] USER_TEAM_MEMBER (<u>id</u>, <u>user_id</u>, <u>team_id</u>)

- [ ] BLOG_USER_VOTE (<u>id</u>, <u>user_id</u>, <u>blog_id</u>, type)

- [ ] USER_CONTEST_ADMIN (<u>id</u>, <u>user_id</u>, <u>contest_id</u>, type)

- [ ] CONTESTANT_CONTEST_REGISTRATION (<u>id</u>, <u>contestant_id</u>, <u>contest_id</u>, standing, rating_change)

- [ ] COMMENT_USER_VOTE (<u>id</u>, <u>user_id</u>, <u>comment_id</u>, type)

- [ ] BLOG_TAG (<u>id</u>, <u>blog_id</u>, <u>tag</u>)

- [ ] CONTEST_ANNOUNCEMENTS (<u>id</u>, <u>contest_id</u>, body, creation_time)

- [ ] PROBLEM_TAG (<u>id</u>, <u>problem_id</u>, <u>tag_id</u>)

- [ ] SUBMISSION_TEST_RUN (<u>id</u>, <u>submission_id</u>, <u>test_id</u>, result, runtime, memory)
