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

- [x] BLOG_POST (<u>id</u>, title, body, creation_time, <u>contest_id</u>, <u>author_id</u>)

- [x] POST_COMMENT (<u>id</u>, body, creation_time, <u>author_id</u>, <u>blog_id</u>, <u>parent_id</u>)

- [x] PROBLEM (<u>id</u>, name, <u>contest_id</u>, body, source_limit, time_limit, memory_limit, rating)

- [x] TEST_FILE (<u>id</u>, <u>problem_id</u>, test_number, type, input, output)

- [x] SUBMISSION (<u>id</u>, <u>problem_id</u>, <u>author_id</u>, submission_time, judge_time, <u>lang_id</u>, code_size)

- [x] USER_USER_FOLLOW (<u>follower_id</u>, <u>followed_id</u>)

- [x] USER_TEAM_MEMBER (<u>user_id</u>, <u>team_id</u>, type)

- [x] BLOG_USER_VOTE (<u>user_id</u>, <u>blog_id</u>, type)

- [x] USER_CONTEST_ADMIN (<u>user_id</u>, <u>contest_id</u>, type)

- [x] CONTEST_REGISTRATION (<u>contestant_id</u>, <u>contest_id</u>, standing, rating_change)

- [x] COMMENT_USER_VOTE (<u>user_id</u>, <u>comment_id</u>, type)

- [x] BLOG_TAG (<u>blog_id</u>, <u>tag_id</u>)

- [x] CONTEST_ANNOUNCEMENTS (<u>contest_id</u>, body, creation_time)

- [x] PROBLEM_TAG (<u>problem_id</u>, <u>tag_id</u>)

- [x] SUBMISSION_TEST_RUN (<u>submission_id</u>, <u>test_id</u>, result, runtime, memory)
