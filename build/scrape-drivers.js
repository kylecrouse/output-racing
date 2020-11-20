const puppeteer = require('puppeteer');
const contentful = require('contentful-management');
const Promise = require('bluebird');
const log = require('log-update');
const chalk = require('chalk');

const username = process.env.IRACING_USERNAME;
const password = process.env.IRACING_PASSWORD;

const client = contentful.createClient({
	accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

(async () => {
	const space = await client.getSpace('38idy44jf6uy');
	const environment = await space.getEnvironment('master');
	const entries = await environment.getEntries({ content_type: "driver" });
	
	console.log('🏎 Connecting to iRacing...');
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
	
	console.log('🗂 Fetching league members...');
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
	
	console.log('🔍 Searching for drivers...');
	
	const colors = {
		waiting: 'gray',
		working: 'white',
		ignored: 'white',
		completed: 'white',
		error: 'red'
	};
	const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
	let frameIndex = -1;
	
	const spinners = Object.assign(
		...members.map(member => ({ [member.custID]: { state: "waiting", text: `Queued ${member.displayName}...` }}))
	);	
	const loop = setInterval(() => {
		frameIndex = frameIndex + 1 >= frames.length ? 0 : frameIndex + 1;
		log(Object.values(spinners).map(
			({ text, state }) => chalk[colors[state]](`${state === "working" ? frames[frameIndex] + ' ' : state === "waiting" ? '🏴' : state === "error" ? '🛑': '🏁'} ${text}`)).join(`\n`)
		);
	}, 80);
	
	await Promise.map(members, member => {
		return new Promise(async (resolve, reject) => {
			try {
				spinners[member.custID] = { state: "working", text: `Connecting to iRacing for ${chalk.magenta(member.displayName)}...` };
				
				const profile = await browser.newPage();
				// profile.on('console', msg => {
				// 	spinners[member.custID].text = `Log for ${chalk.magenta(member.displayName)}: ${msg.args().join(', ')}`;
				// });
				await profile.goto(`https://members.iracing.com/membersite/member/CareerStats.do?custid=${member.custID}`, { timeout: 60000, waitUntil: 'networkidle2' });
				
				spinners[member.custID].text = `Fetching license for ${chalk.magenta(member.displayName)}...`;
				const license = await profile.evaluate(() => window.MemberProfile.driver.licenses.find(({ catId }) => catId === 1));
				spinners[member.custID].text = `Retrieved license for ${chalk.magenta(member.displayName)}.`;
				
				spinners[member.custID].text = `Fetching stats for ${chalk.magenta(member.displayName)}...`;
				const stats = await profile.evaluate((custid, name) => {
					return new Promise((resolve, reject) => {
						loadGet(
							"/memberstats/member/GetCareerStats",
							{ custid },
							function (req) {
								return function() {
									console.log(req.readyState, req.status);
									if (req.readyState == 4) {
											if (req.status == 200) {
													var data = extractJSON(req.responseText);
													if (data) {
														decodeAllFields(data);
														// filter these results to only return Oval stats
														resolve(data.find(item => item.category === 'Oval'));
													}
											} else if (req.status === 429) {
												resolve(null);
											}
									}
								}					
							}	
						);
					});
				}, member.custID, member.displayName);
				spinners[member.custID].text = `Retrieved stats for ${chalk.magenta(member.displayName)}.`;
				
				await profile.close();
				
				spinners[member.custID].text = `Retrieving existing data for ${chalk.magenta(member.displayName)}...`;
				const driver = entries.items.splice(
					entries.items.findIndex(driver => isFieldEqual(driver.fields.custId, member.custID)), 
					1
				);
				if (driver.length > 0) {
					// Update
					let updatedFields = [];
					if (!isFieldEqual(driver[0].fields.name, member.displayName)) {
						driver[0].fields.name = localize(member.displayName);
						updatedFields.push('name');
					}
					if (!isFieldEqual(driver[0].fields.nickname, member.driver_nickname)) {
						driver[0].fields.nickname = localize(member.driver_nickname);
						updatedFields.push('nickname');
					}
					if (!isFieldEqual(driver[0].fields.number, member.car_number)) {
						driver[0].fields.number = localize(member.car_number);
						updatedFields.push('number');
					}
					if (!isFieldEqual(driver[0].fields.custId, member.custID)) {
						driver[0].fields.custId = localize(member.custID);
						updatedFields.push('iRacing ID');
					}
					if (!isFieldEqual(driver[0].fields.active, true)) {
						driver[0].fields.active = localize(true);
						updatedFields.push('active status');
					}
					if (!isFieldEqual(driver[0].fields.license, license)) {
						driver[0].fields.license = localize(license);
						updatedFields.push('license');
					}
					if (stats && !isFieldEqual(driver[0].fields.careerStats, stats)) {
						driver[0].fields.careerStats = localize(stats);
						updatedFields.push('stats');
					}
					if (updatedFields.length > 0) {
						spinners[member.custID].text = `Updating data for ${chalk.magenta(member.displayName)}...`;
						const entry = await driver[0].update();
						spinners[member.custID].text = `Publishing ${chalk.magenta(member.displayName)}...`;
						await entry.publish();
						spinners[member.custID] = { state: "completed", text: `Updated ${updatedFields.join(', ')} for ${chalk.green(member.displayName)}.` };
					} else {
						spinners[member.custID] = { state: "ignored", text: `No changes for ${chalk.yellow(member.displayName)}.` };
					}
				} else {
					// Add
					spinners[member.custID].text = `Creating ${chalk.magenta(member.displayName)}...`;
					const entry = await environment.createEntry('driver', { fields: {
						name: localize(member.displayName),
						nickname: localize(member.driver_nickname),
						number: localize(member.car_number),
						custId: localize(member.custID),
						active: localize(true),
						license: localize(license),
						careerStats: localize(stats)
					}});
					spinners[member.custID].text = `Publishing ${chalk.magenta(member.displayName)}...`;
					await entry.publish();
					spinners[member.custID] = { state: "completed", text: `Added ${chalk.green(member.displayName)}.` };
				}
				
				resolve();
        
			} catch(e) {
        spinners[member.custID] = { state: "error", text: `Error with ${chalk.bold(member.displayName)}: ${JSON.stringify(e)}` };
        reject(e);
      }
		});
	}, { concurrency: 3 });
	
	clearInterval(loop);
	log.done();
	
	await Promise.all(entries.items.map(async (driver) => {
		if (!isFieldEqual(driver.fields.active, false)) {
			driver.fields.active = localize(false);
			const entry = await driver.update();
			await entry.publish();
			console.log(`🏁 Deactivated ${chalk.red(driver.fields.name['en-US'])}.`);
		} else {
			console.log(`🏁 No changes for ${chalk.yellow(driver.fields.name['en-US'])}.`);
		}
	}));
	
  console.log('✨  Done.');
  
	await browser.close();
	
})().catch((e) => console.error(e));

function isFieldEqual(actual, expected) {
	return JSON.stringify(actual) === JSON.stringify(localize(expected));
}

function localize(value) {
	return { 'en-US': value };
}