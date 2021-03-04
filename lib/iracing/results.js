const { waitForAuthentication } = require('./auth');
const Promise = require('bluebird');

module.exports = {
  getLeagueSessions: async (leagueID, page) => {
    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto league sessions page
  	await page.goto(`https://members.iracing.com/membersite/member/LeagueSessions.do`);
    
    // Get sessions for the requested league
    const { rows = [] } = await page.evaluate((leagueID) => {
			return new Promise((resolve, reject) => {
				load(
					"/membersite/member/GetLeagueSessions",
					{ ts: 0, startRow: 1, stopRow: 20, leagueID, rand: Math.floor(Math.random()*1000000) },
					function (req) {
						return function() {
							if (req.readyState == 4) {
									if (req.status == 200) {
										var data = extractJSON(req.responseText);
										decodeAllFields(data);
										resolve(data);
									} else if (req.status === 429) {
										resolve(null);
									}
							}
						}					
					}	
				);
			});
		}, leagueID);

    return rows;
    
  },
  getLatestResults: async (league_id, page) => {
  
    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto league home page
  	await page.goto(`https://members.iracing.com/membersite/member/LeagueView.do?league=${league_id}`);

    // Extract the subsession ID of the latest league race
    // TODO: Test to ensure has valid race session
  	const subSessionId = await page.evaluate(
      () => window.LeagueViewPage.GlobalSeasonsData.r[0].previousrace[0].subsessionid
    );

    // Goto the event results page for the subsession
  	await page.goto(`https://members.iracing.com/membersite/member/EventResult.do?&subsessionid=${subSessionId}`);

    // Return the source of the results page
    return page.content();

  },
  getSeriesResults: async (seasonid, page) => {

    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto series results page
  	await page.goto(`https://members.iracing.com/membersite/member/SeriesRaceResults.do?season=${seasonid}`);
    
    // Get current raceweek value from series page
    const raceweek = await page.$eval('#weekSelect', el => el.value);
    
    // Get races for the current week
    const races = await page.evaluate(({ seasonid, raceweek }) => {
			return new Promise((resolve, reject) => {
				load(
					"/memberstats/member/GetSeriesRaceResults",
					{ seasonid, raceweek, invokedBy: "SeriesRaceResults" },
					function (req) {
						return function() {
							if (req.readyState == 4) {
									if (req.status == 200) {
										var data = extractJSON(req.responseText);
										decodeAllFields(data);
										resolve(data);
									} else if (req.status === 429) {
										resolve(null);
									}
							}
						}					
					}	
				);
			});
		}, { seasonid, raceweek });

    // Get results for all subsessions
    return Promise.map(
      races.map(race => race.subsessionid),
      (subsessionID) => page.evaluate((subsessionID) => {
  			return new Promise((resolve, reject) => {
  				load(
  					"/membersite/member/GetSubsessionResults",
  					{ subsessionID, custid: "433984" },
  					function (req) {
  						return function() {
  							if (req.readyState == 4) {
  									if (req.status == 200) {
  										var data = extractJSON(req.responseText);
  										decodeAllFields(data);
  										resolve(data);
  									} else if (req.status === 429) {
  										resolve(null);
  									}
  							}
  						}					
  					}	
  				);
  			});
  		}, subsessionID),
      { concurrency: 1 }
    );

  }
}