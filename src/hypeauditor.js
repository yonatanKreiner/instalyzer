const fs = require('fs');
const util = require('util');
const logger = require('./logger');
const htmlToPdf = require('./htmlToPdf');

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

	if (titleLower === 'very good') {
		return 'very-good';
	} else if (titleLower === 'could be improved') {
		return 'could-be-improved';
	}

	return titleLower;
};

const audienceTypeData = (audienceType) => {
	return audienceType &&
		(audienceType.moreThen1500Followers || audienceType.moreThen5000Followings || audienceType.real || audienceType.suspicious)
		? `<div class="flex-column section-margin">
			<div class="underline-text">סיווג</div>`
		+ (audienceType.real
			? `<div class="flex-row">
						<div class="classification-title">אנשים אמיתיים</div>
						<div>${audienceType.real}%</div>
					</div>`
			: '')
		+ (audienceType.moreThen5000Followings
			? `<div class="flex-row">
						<div class="classification-title">בעלי יותר מ-5000 עוקבים</div>
						<div>${audienceType.moreThen5000Followings}%</div>
					</div>`
			: '')
		+ (audienceType.moreThen1500Followers
			? `<div class="flex-row">
						<div class="classification-title">עוקבים אחר יותר מ-1500 חשבונות</div>
						<div>${audienceType.moreThen1500Followers}%</div>
					</div>`
			: '')
		+ (audienceType.suspicious
			? `<div class="flex-row section-margin">
								<div class="classification-title">משתמשים חשודים</div>
								<div>${audienceType.suspicious}%</div>
							</div>`
			: ''
			+ `</div>`)
		: '';
}

const moreDetailsSection = (shouldShow) => shouldShow
	? `<div class="flex-column section-margin">
	<div class="info-section-title">מידע נוסף</div>
	%AD_POSTS_PERCENTAGE_SECTION%
	%DEMOGRAPHY_DATA_SECTION%
</div>`
	: '';

const adPostsPercentageData = (adPostsPercentage) => adPostsPercentage
	? `<div class="classification-more-data classification-metric-addition-data">
	אחוז פוסטים פרסומיים: ${adPostsPercentage}%
</div>`
	: '';

const demographyData = (demographyData) => (demographyData && demographyData.length)
	? `<div class="classification-more-data classification-metric-addition-data">
אחוז גברים עוקבים: ${demographyData.find((x) => x.gender === 'male').value}%
</div>
<div class="classification-more-data classification-metric-addition-data">
אחוז נשים עוקבות: ${demographyData.find((x) => x.gender === 'female').value}%
</div>`
	: '';

const adEngagementRateData = (adEngagementRate) => adEngagementRate
	? `<div class="flex-column section-margin">
	<div class="info-section-title">אחוז עוקבים פעילים על תוכן פרסומי</div>
	<div class="info-section-rate-container">
		<div class="info-section-rate-circle title-color-${titleToColorClass(adEngagementRate.title)}"></div>
		<div>${titleEnglishToHebrew(adEngagementRate.title)}</div>
	</div>
	<div class="classification-metric-addition-data">
	${adEngagementRate.value}% מבצעים פעולות אקטיביות על תוכן פרסומי, הממוצע הוא ${adEngagementRate.avg}%
	</div>
</div>`
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
		.replace('%AUDIENCE_QUALITY_COLOR%', titleToColorClass(reportObject.audienceQualityScore.title))
		.replace('%AUDIENCE_TYPE_SECTION%', audienceTypeData(reportObject.audienceType))
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
		.replace('%MORE_DETAILS_SECTION%', moreDetailsSection(reportObject.adPostsPercentage && reportObject.demography.length))
		.replace('%AD_POSTS_PERCENTAGE_SECTION%', adPostsPercentageData(reportObject.adPostsPercentage))
		.replace('%DEMOGRAPHY_DATA_SECTION%', demographyData(reportObject.demography))
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
		const userReportData = report.data.result.user;
		delete userReportData.likes_comments_ratio_chart;
		delete userReportData.followers_chart;
		delete userReportData.following_chart;
		await writeFile('./saved-reports/' + account + '-' + (+new Date()) + '.json', JSON.stringify(userReportData));
	}

	return report;
};

const fakeReport = () => new Promise(resolve => {
	setTimeout(() => {
		resolve({ data: mockReportJson });
	}, 500);
});

const environmentGetReport = () => process.env.REPORT_TYPE === 'REAL' ? realReport : fakeReport;

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

		const pdfPath = './saved-reports/' + account + '-' + (+new Date()) + '.pdf';
		await htmlToPdf(pdfPath, formattedHtml);

		return pdfPath;

	} catch (err) {
		logger.fatal('failed getting report', err);
	}
};

module.exports = getReport;
