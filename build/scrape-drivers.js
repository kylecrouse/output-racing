const puppeteer = require('puppeteer');
const contentful = require('contentful-management');

const username = process.env.IRACING_USERNAME;
const password = process.env.IRACING_PASSWORD;

const client = contentful.createClient({
	accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

(async () => {
	const space = await client.getSpace('38idy44jf6uy');
	const environment = await space.getEnvironment('master');
	const entries = await environment.getEntries({ content_type: "driver" });
	
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto('https://members.iracing.com/membersite/login.jsp');
	
	const userField = await page.$('[name="username"]');
	await userField.focus();
	await userField.type(username);
	
	const passwordField = await page.$('[name="password"]');
	await passwordField.focus();
	await passwordField.type(password);
	
	const button = await page.$('input.log-in');
	await button.click();
	
	await page.waitForResponse('https://members.iracing.com/membersite/member/Home.do');
	
	await page.goto('https://members.iracing.com/membersite/member/LeagueView.do?league=2732');

	const LeagueViewPage = await page.evaluate(() => window.LeagueViewPage);
	const limit = LeagueViewPage.config.numMembersPerPage;
	let start = LeagueViewPage.config.memberToStartAt;
	let results = [];
	let members = [];
	
	do {
		results = await page.evaluate(({ start, limit }) => {
			return new Promise((resolve, reject) => {
				load(
					contextpath + "/member/GetLeagueMembers", 
					{ 
						leagueid: 2732, 
						lowerBound: start, 
						upperBound: start + limit - 1 
					},
					function (req) {
						return function() {
							if (req.readyState == 4) {
									if (req.status == 200) {
											var MemberData = extractJSON(req.responseText);
											if (MemberData) {
													decodeAllFields(MemberData);
											}
											resolve(MemberData);
									}
							}
						}					
					}	
				);
			});
		}, {start, limit});
		
		members = members.concat(results);
		start += results.length;
		
	} while (results.length === limit);
  
  	await Promise.all(members.map(async (member) => {
		const driver = entries.items.splice(
			entries.items.findIndex(driver => driver.fields.custId['en-US'] === member.custID), 
			1
		);
		if (driver.length > 0) {
			// Update
			driver[0].fields.name['en-US'] = member.driver_nickname.length > 0 ? member.driver_nickname : member.displayName;
			driver[0].fields.number['en-US'] = member.car_number;
			driver[0].fields.custId['en-US'] = member.custID;
			driver[0].fields.active['en-US'] = true;
			await driver[0].update();
			console.log(`updated ${member.displayName}...`);
		} else {
			// Add
			const entry = await environment.createEntry('driver', { fields: {
				name: { 'en-US': member.driver_nickname.length > 0 ? member.driver_nickname : member.displayName },
				number: { 'en-US': member.car_number },
				custId: { 'en-US': member.custID },
				active: { 'en-US': true },
			}});
			await entry.publish();
			console.log(`added ${member.displayName}...`);
		}
	}));
	
	await Promise.all(entries.items.map(async (entry) => {
		entry.fields.active['en-US'] = false;
		await entry.update();
		console.log(`deactivated ${entry.fields.name['en-US']}...`);
	}));
	
	await browser.close();
	
})().catch((e) => console.error(e));