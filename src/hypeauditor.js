const fs = require('fs');
const util = require('util');
const logger = require('./logger');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const mockReportJson = require('./mock-report.json');

const axios = require('axios');

const hypeAuditorUrl = 'https://hypeauditor.com/api/method/auditor.report';

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
		adEngagementRate: advertising_data && { value: advertising_data.avg_ad_er, avg: advertising_data.avg_er, title: advertising_data.avg_er_display[0] },
		adPostsPercentage: advertising_data && advertising_data.ad_posts.prc
	};
};

const titleToColorClass = (title) => {
	const titleLower = title.toLowerCase();
	const colorStart = 'title-color-';

	if (titleLower === 'very good') {
		return colorStart + 'very-good';
	}

	return colorStart + titleLower;
};

const adEngagementRateData = (adEngagementRate) => adEngagementRate
	? `<th class="mesaurement-section" class="table-body-row">
	<span class="measurement-title">אחוז
		עוקבים פעילים על תוכן פרסומי</span>
	<span>
		<span class='${titleToColorClass(adEngagementRate.title)}' style="display: inline-block; width: 12px; height: 12px; border-radius: 10px;"></span>
		<span class="mesaurement-level-text">${titleEnglishToHebrew(adEngagementRate.title)}</span>
	</span>
	<span class="mesaurement-value-text">${adEngagementRate.value}%
		מבצעים פעולות אקטיביות על תוכן פרסומי, הממוצע הוא ${adEngagementRate.avg}%</span>
</th>`
	: '';

const adPostsPercentageData = (adPostsPercentage) => adPostsPercentage
	? `<span class="mesaurement-value-text">
	<span style="margin-left: 5px">אחוז פוסטים פרסומיים:</span>
	<span>${adPostsPercentage}%</span>
</span>`
	: '';

const titleEnglishToHebrew = (title) => {
	switch (title.toLowerCase()) {
		case 'could be improved': return 'טעון שיפור';
		case 'excellent': return 'מצויין';
		case 'very good': return 'טוב מאוד';
		case 'good': return 'טוב';
		case 'poor': return 'עלוב';
		case 'average': return 'ממוצע';
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
		.replace('%ACTIVE_FOLLOWERS_AD_SECTION%', adEngagementRateData(reportObject.adEngagementRate))
		.replace('%AD_POSTS_PERCENTAGE_SECTION%', adPostsPercentageData(reportObject.adPostsPercentage))
		.replace('%MALE_PERCENTAGE%', reportObject.demography.find((x) => x.gender === 'male').value)
		.replace('%FEMALE_PERCENTAGE%', reportObject.demography.find((x) => x.gender === 'female').value);
};

// eslint-disable-next-line no-unused-vars
const realReport = async (account) => {
	let report = null;
	try {
		report = await axios.post(hypeAuditorUrl, `username=${account}&v=2`, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'x-auth-id': process.env.HYPEAUDITOR_ID,
				'x-auth-token': process.env.HYPEAUDITOR_TOKEN,
			}
		});
	} catch (err) {
		if (err.response && err.response.data && err.response.data.error) {
			throw JSON.stringify(err.response.data.error);
		} else {
			throw err;
		}
	}

	if (process.env.NODE_ENV === 'development') {
		const { likes_comments_ratio_chart, following_chart, followers_chart, ...filteredReport } = report.data.result.user;
		await writeFile('./saved-reports/' + account + '-' + (+new Date()) + '.json', JSON.stringify(filteredReport));
	}

	return report;
};

const fakeReport = () => new Promise(resolve => {
	setTimeout(() => {
		resolve({ data: mockReportJson });
	}, 500);
});

const environmentGetReport = () => process.env.NODE_ENV === 'development' ? fakeReport : realReport;

const getReport = async (account) => {
	const firstName = 'משתמש/ת יקר/ה';

	try {
		const report = await environmentGetReport()(account);
		const reportData = report.data;
		const userData = reportData.result.user;
		if (userData.followers_count && userData.followers_count < 1000) {
			throw `User ${account} has 1000 or less followers (${userData.followers_count})`;
		}

		const reportObject = buildReportObjectFromUserDate(userData, firstName);

		const emailHtml = await readFile('./src/email-format.html', 'utf8');
		const formattedHtml = formatEmailHtml(emailHtml, reportObject);

		return formattedHtml;

	} catch (err) {
		logger.fatal('failed getting report', err);
	}
};

module.exports = getReport;
