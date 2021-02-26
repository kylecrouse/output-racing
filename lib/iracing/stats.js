const { waitForAuthentication } = require('./auth');

module.exports = {
  getCareerStats: async (custid, page) => {

    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto member page
  	await page.goto(
      `https://members.iracing.com/membersite/member/CareerStats.do?custid=${custid}`, 
      { timeout: 60000, waitUntil: 'networkidle2' }
    );
    
    const [license, stats, memberSince, clubId] = await Promise.all([
      // Get license object for member
  		page.evaluate(() => 
        window.MemberProfile.driver.licenses.find(({ catId }) => catId === 1)
      ),
      // Use iRacing methods in browser to get career stats data
      page.evaluate((custid) => {
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
  		}, custid),
  		page.evaluate(() => window.MemberProfile.driver.memberSince),
      page.evaluate(() => window.MemberProfile.driver.clubId)
    ]);
    
    return { license, stats, memberSince, clubId };

  },
  getSeasonStandings: async (seasonid, custid, page) => {

    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto series results page
  	await page.goto(`https://members.iracing.com/membersite/member/SeriesStandings.do?season=${seasonid}`);
    
    // Use iRacing methods in browser to get last 10 races stats data
    const stats = await page.evaluate(({ seasonid, custid }) => {
			return new Promise((resolve, reject) => {
				load(
					"/memberstats/member/GetSeasonStandings",
					{ seasonid, carclassid: 50, clubid: -1, raceweek: -1, division: -1, start: 1, end: 1, sort: "points", order: "desc", custid },
					function (req) {
						return function() {
							if (req.readyState == 4) {
									if (req.status == 200) {
										var data = extractJSON(req.responseText);
										decodeAllFields(data);
            				load(
            					"/memberstats/member/GetSeasonStandings",
            					{ seasonid, carclassid: 50, clubid: -1, raceweek: -1, division: -1, start: data.custrow, end: data.custrow, sort: "points", order: "desc", custid },
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
									} else if (req.status === 429) {
										resolve(null);
									}
							}
						}					
					}	
				);
			});
		}, { seasonid, custid });
    
    return stats;

  }  
}