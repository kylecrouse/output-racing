const puppeteer = require('puppeteer');
const contentful = require('contentful-management');
const log = require('log-update');
const chalk = require('chalk');
const moment = require('moment');
const { spawn } = require('child_process');
const fs = require('fs/promises');

const leagueId = process.env.DANLISA_LEAGUE_ID;

const username = process.env.IRACING_USERNAME;
const password = process.env.IRACING_PASSWORD;

const drivername = process.env.DANLISA_USERNAME;
const driverpasswd = process.env.DANLISA_PASSWORD;

const client = contentful.createClient({
	accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
});

(async () => {
	const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
	const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT_ID);
	const league = await environment.getEntry(leagueId);
	const season = await environment.getEntry(league.fields.activeSeason['en-US'].sys.id);
	
	//Get next schedule ID without results uploaded from league's active season schedule
	const { scheduleId = null } = season.fields.schedule['en-US']
		.filter(item => !item.raceId)
		.sort((a, b) => moment(b.date).diff(a.date))
		.pop();

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
	
	console.log('🗂 Fetching race results...');
	await page.goto('https://members.iracing.com/membersite/member/LeagueView.do?league=2732');

	const subSessionId = await page.evaluate(() => window.LeagueViewPage.GlobalSeasonsData.r[0].previousrace[0].subsessionid);

	await page.goto(`https://members.iracing.com/membersite/member/EventResult.do?&subsessionid=${subSessionId}`);
	console.log('💾 Saving race results...', { subSessionId });
  await fs.writeFile('EventResult.html', await page.content());
	
	// Login as an admin to DanLisa
	console.log('🔐 Logging in to DanLisa scoring...');
	await page.goto(`https://www.danlisa.com/scoring/login_form.php?returnto=%2Fscoring%2Fseason_race_upload.php%3Fschedule_id%3D${scheduleId}`);
	
	const userField2 = await page.$('#driver_name');
	await userField2.focus();
	await userField2.type(drivername);
	
	const passwordField2 = await page.$('#driver_passwd');
	await passwordField2.focus();
	await passwordField2.type(driverpasswd);
	
	const loginButton = await page.$('input[type=button][value="Log In"]');
	await loginButton.click();
	
	await page.waitForResponse(`https://www.danlisa.com/scoring/season_race_upload.php?schedule_id=${scheduleId}`);
	
	console.log('🌎 Uploading race results...', { scheduleId });
	await page.waitForSelector('form input[type=file]');
	const [fileChooser] = await Promise.all([
	  page.waitForFileChooser(),
	  page.click('form input[type=file]'), // some button that triggers file selection
	]);
	await fileChooser.accept(['EventResult.html']);
	const [response] = await Promise.all([
		page.waitForResponse(response => {
			return response.url().match(/season_race.php/) && response.status() === 200
		}),
		page.click('form input[type=submit]')
	])
	const raceId = response.url().split("=").pop();
	
	console.log('💾 Updating stats and standings...');
  await Promise.all([
		// Parse new race results
		new Promise((resolve, reject) => {
	    const yarn = spawn('yarn', ['race', raceId]);
	    yarn.stdout.on('data', (data) => { 
	      console.log(data.toString().replace(/\r?\n|\r/g, ''));
	    });
	    yarn.stderr.on('data', (data) => { 
	      console.error(data.toString().replace(/\r?\n|\r/g, ''));
	    });
	    yarn.on('close', (code) => {
				console.log('Closed race results process.');
	      resolve();
	    });
	  }),	
		// Update season standings
		new Promise((resolve, reject) => {
	    const yarn = spawn('yarn', ['standings', season.sys.id]);
	    yarn.stdout.on('data', (data) => { 
	      console.log(data.toString().replace(/\r?\n|\r/g, ''));
	    });
	    yarn.stderr.on('data', (data) => { 
	      console.error(data.toString().replace(/\r?\n|\r/g, ''));
	    });
	    yarn.on('close', (code) => {
				console.log('Closed standings process.');
	      resolve();
	    });
	  }),	
	]);
		
	// Handle stats separately to avoid race conditions with saving entries
  await Promise.all([
		// Update season stats
	  new Promise((resolve, reject) => {
	    const yarn = spawn('yarn', ['stats', 'season_id', season.sys.id]);
	    yarn.stdout.on('data', (data) => { 
	      console.log(data.toString().replace(/\r?\n|\r/g, ''));
	    });
	    yarn.stderr.on('data', (data) => { 
	      console.error(data.toString().replace(/\r?\n|\r/g, ''));
	    });
	    yarn.on('close', (code) => {
				console.log('Closed season stats process.');
	      resolve();
	    });
	  }),
		// Update league stats
	  new Promise((resolve, reject) => {
	    const yarn = spawn('yarn', ['stats', 'league_id', leagueId]);
	    yarn.stdout.on('data', (data) => { 
	      console.log(data.toString().replace(/\r?\n|\r/g, ''));
	    });
	    yarn.stderr.on('data', (data) => { 
	      console.error(data.toString().replace(/\r?\n|\r/g, ''));
	    });
	    yarn.on('close', (code) => {
				console.log('Closed league stats process.');
	      resolve();
	    });
	  })
	]);

	// Update season with new race result entry
	console.log('✏️ Publishing race results...', { raceId });
	const updatedSeason = await environment.getEntry(season.sys.id);
	updatedSeason.fields.schedule['en-US'] = updatedSeason.fields.schedule['en-US'].map(item => {
		if (item.scheduleId === scheduleId) item.raceId = raceId;
		return item;
	});
	await updatedSeason.update().then(entry => entry.publish());

	console.log('🧹 Cleaning up...');
	await fs.unlink('EventResult.html');

	await browser.close();
	
})().catch((e) => console.error(e));