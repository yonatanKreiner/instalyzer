const fs = require('fs');
const util = require('util');
const log = require('./log');
const readFile = util.promisify(fs.readFile);

const mockReportJson = require('./mock-report.json');

const axios = require('axios');

const hypeAuditorUrl = 'https://hypeauditor.com/api/method/auditor.report';
const hypeAuditorId = '293591'; // mbinyaminov@gmail.com
const hypeAuditorToken = '$2y$04$aq3T7eKX5ZU59w61VCBpAe1czYN8Idhk4crTKGIyO7j/rpseYKcrG';

const buildReportObjectFromUserDate = (userData, firstName) => {
	const {
		username,
		aqs, // = audience quality score out of 100
		aqs_name,
		likes_spread, // difference likes rates between posts
		likes_comments_ratio, // .value comments per 100 likes
		audience_reachability, // .value% of followers have less then 1500 following. 
		audience_authenticity, // .value of followers look authentic
		audience_type, // real, influencers ( more then 5000 followers ), mass followers ( more then 1500 following ), suspicious
		er, // engagement rate = .value of audience like or comment
		advertising_data, // avg_ad_er - engagement rate for ads, ad_posts.prc - percentage of posts are ads, 
		demography_by_age,
	} = userData;

	return {
		username,
		firstName,
		audienceQualityScore: { value: aqs, title: aqs_name },
		likesSpread: likes_spread,
		likesToCommentRatio: likes_comments_ratio,
		audienceReach: audience_reachability,
		audienceAuthentic: audience_authenticity,
		audienceType: { real: audience_type.real, suspicious: audience_type.susp, moreThen5000Followings: audience_type.infs, moreThen1500Followers: audience_type.mass },
		engagementRate: er,
		demography: demography_by_age,
		adEngagementRate: { value: advertising_data.avg_ad_er, avg: advertising_data.avg_er, title: advertising_data.avg_er_display[0] },
		adPostsPercentage: advertising_data.ad_posts.prc
	};
};

const titleEnglishToHebrew = (title) => {
	switch (title.toLowerCase()) {
	case 'very good': return 'טוב מאוד';
	case 'good': return 'טוב';
	case 'poor': return 'עלוב';
	default: return 'לא ידוע';
	}
};

const formatEmailHtml = (emailHtml, reportObject) => {
	return emailHtml
		.replace('%FIRST_NAME%', reportObject.firstName)
		.replace(new RegExp('%USERNAME%', 'g'), reportObject.username)
		.replace('%AUDIENCE_QUALITY%', reportObject.audienceQualityScore.value)
		.replace('%AUDIENCE_QUALITY_TITLE%', titleEnglishToHebrew(reportObject.audienceQualityScore.title))
		.replace('%REAL_PEOPLE%', reportObject.audienceType.real)
		.replace('%INFLUENCERS%', reportObject.audienceType.moreThen5000Followings)
		.replace('%MASS_FOLLOWERS%', reportObject.audienceType.moreThen1500Followers)
		.replace('%FAKE%', reportObject.audienceType.suspicious)
		.replace('%LIKE_TO_COMMENT_RATIO_TITLE%', titleEnglishToHebrew(reportObject.likesToCommentRatio.title))
		.replace('%LIKE_TO_COMMENT_RATIO_COLOR%', titleToColorClass(reportObject.likesToCommentRatio.title))
		.replace('%LIKE_TO_COMMENT_RATIO_VALUE%', reportObject.likesToCommentRatio.value)
		.replace('%LIKE_TO_COMMENT_RATIO_AVG%', reportObject.likesToCommentRatio.avg)
		.replace('%FOLLOWERS_AUTHENTICITY_TITLE%', titleEnglishToHebrew(reportObject.audienceAuthentic.title))
		.replace('%FOLLOWERS_AUTHENTICITY_COLOR%', titleToColorClass(reportObject.audienceAuthentic.title))
		.replace('%FOLLOWERS_AUTHENTICITY_VALUE%', reportObject.audienceAuthentic.value)
		.replace('%FOLLOWERS_AUTHENTICITY_AVG%', reportObject.audienceAuthentic.avg)
		.replace('%ACTIVE_FOLLOWERS_TITLE%', titleEnglishToHebrew(reportObject.engagementRate.title))
		.replace('%ACTIVE_FOLLOWERS_COLOR%', titleToColorClass(reportObject.engagementRate.title))
		.replace('%ACTIVE_FOLLOWERS_VALUE%', reportObject.engagementRate.value)
		.replace('%ACTIVE_FOLLOWERS_AVG%', reportObject.engagementRate.avg)
		.replace('%ACTIVE_FOLLOWERS_AD_TITLE%', titleEnglishToHebrew(reportObject.adEngagementRate.title))
		.replace('%ACTIVE_FOLLOWERS_AD_COLOR%', titleToColorClass(reportObject.adEngagementRate.title))
		.replace('%ACTIVE_FOLLOWERS_AD_VALUE%', reportObject.adEngagementRate.value)
		.replace('%ACTIVE_FOLLOWERS_AD_AVG%', reportObject.adEngagementRate.avg)
		.replace('%AD_POSTS_PERCENTAGE%', reportObject.adPostsPercentage)
		.replace('%MALE_PERCENTAGE%', reportObject.demography.find((x) => x.gender === 'male').value)
		.replace('%FEMALE_PERCENTAGE%', reportObject.demography.find((x) => x.gender === 'female').value);
};

const titleToColorClass = (title) => {
	const titleLower = title.toLowerCase();
	const colorStart = 'title-color-';

	if (titleLower === 'very good') {
		return colorStart + 'very-good';
	}

	return colorStart + titleLower;
};

// eslint-disable-next-line no-unused-vars
const realReport = (account) => {
	return axios.post(hypeAuditorUrl, `username=${account}&v=2`, {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'x-auth-id': hypeAuditorId,
			'x-auth-token': hypeAuditorToken,
		}
	});
};

const fakeReport = () => new Promise(resolve => {
	setTimeout(() => {
		resolve({ data: mockReportJson });
	}, 500);
});

const getReport = async (account) => {
	const firstName = 'יונתן';

	try {
		const report = await fakeReport(account);
		const reportData = report.data;
		const userData = reportData.result.user;
		const reportObject = buildReportObjectFromUserDate(userData, firstName);

		const emailHtml = await readFile('./src/email-format.html', 'utf8');
		const formattedHtml = formatEmailHtml(emailHtml, reportObject);

		return formattedHtml;

	} catch (err) {
		log('failed getting report', err);
	}
};

module.exports = getReport;
