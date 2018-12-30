const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

const mockReportJson = require('./mock-report.json');

const axios = require('axios');

const hypeAuditorUrl = 'https://hypeauditor.com/api/method/auditor.report';
const hypeAuditorId = '293591'; // mbinyaminov@gmail.com
const hypeAuditorToken = '$2y$04$aq3T7eKX5ZU59w61VCBpAe1czYN8Idhk4crTKGIyO7j/rpseYKcrG';

const titleEnglishToHebrew = (title) => {
    switch (title.toLowerCase()) {
        case 'very good': return 'טוב מאוד';
        case 'good': return 'טוב';
        case 'poor': return 'עלוב';
        default: return 'לא ידוע';
    }
};

const realReport = (account) => {
    return axios.post(hypeAuditorUrl, `username=${account}&v=2`, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-auth-id': hypeAuditorId,
            'x-auth-token': hypeAuditorToken,
        }
    });
};

const fakeReport = () => new Promise(function (resolve, reject) {
    setTimeout(function () {
        resolve({ data: mockReportJson });
    }, 500);
});

const getReport = async (account) => {
    const firstName = 'יונתן';

    try {
        const report = await fakeReport(account);

        const reportData = report.data;

        const userData = reportData.result.user;
        const {
            username,
            full_name,
            aqs, // = audience quality score out of 100
            aqs_name,
            likes_spread, // difference likes rates between posts
            likes_comments_ratio, // .value comments per 100 likes
            audience_reachability, // .value% of followers have less then 1500 following. 
            audience_authenticity, // .value of followers look authentic
            audience_type, // real, influencers ( more then 5000 followers ), mass followers ( more then 1500 following ), suspicious
            post_frequency,
            er, // engagement rate = .value of audience like or comment
            demography,
            audience_languages,
            growth,
            audience_geography,
            top3_blogger_topics,
            audience_interests,
            comments_authenticity,
            advertising_data, // avg_ad_er - engagement rate for ads, ad_posts.prc - percentage of posts are ads, 
            demography_by_age,
        } = userData;

        const reportObject = {
            username: username,
            firstName, firstName,
            audienceQualityScore: { value: aqs, title: aqs_name },
            likesSpread: likes_spread,
            likesToCommentRatio: likes_comments_ratio,
            audienceReach: audience_reachability,
            audienceAuthentic: audience_authenticity,
            audienceType: { real: audience_type.real, suspicious: audience_type.susp, moreThen5000Followings: audience_type.infs, moreThen1500Followers: audience_type.mass },
            engagementRate: er,
            demography: demography_by_age,
            adEngagementRate: { value: advertising_data.avg_ad_er, avg: advertising_data.avg_er, title: advertising_data.avg_er_display },
            adPostsPercentage: advertising_data.ad_posts.prc
        };

        const emailHtml = await readFile('./src/email-format.html', 'utf8');
        const formattedHtml = emailHtml
            .replace('%FIRST_NAME%', reportObject.firstName)
            .replace(new RegExp('%USERNAME%', 'g'), reportObject.username)
            .replace('%AUDIENCE_QUALITY%', reportObject.audienceQualityScore.value)
            .replace('%AUDIENCE_QUALITY_TITLE%', titleEnglishToHebrew(reportObject.audienceQualityScore.title))
            .replace('%REAL_PEOPLE%', reportObject.audienceType.real)
            .replace('%INFLUENCERS%', reportObject.audienceType.moreThen5000Followings)
            .replace('%MASS_FOLLOWERS%', reportObject.audienceType.moreThen1500Followers)
            .replace('%FAKE%', reportObject.audienceType.suspicious)
            .replace('%LIKE_TO_COMMENT_RATIO_TITLE%', titleEnglishToHebrew(reportObject.likesToCommentRatio.title))
            .replace('%LIKE_TO_COMMENT_RATIO_VALUE%', reportObject.likesToCommentRatio.value)
            .replace('%LIKE_TO_COMMENT_RATIO_AVG%', reportObject.likesToCommentRatio.avg)
            ;

        return formattedHtml;
        // const user = (await axios.get('https://fetcher.igaudit.io/user/' + account)).data;
        // const res = await axios.get('https://api.igaudit.io/sample_follower_usernames/' + user.userId,
        // 	{ headers: { Origin: 'https://igaudit.io' } });
        // return { userId: user.userId, followers: res.data.followers };
    } catch (err) {
        console.error(err.message);
    }
};

module.exports = getReport;