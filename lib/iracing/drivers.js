const { waitForAuthentication } = require('./auth');

module.exports = {
  getDrivers: async (league_id, page) => {

    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto league home page
  	await page.goto(`https://members.iracing.com/membersite/member/LeagueView.do?league=${league_id}`);
    
    // Get initial pagination values
    let { numMembersPerPage: limit, memberToStartAt: start } = await page.evaluate(() => window.LeagueViewPage.config);

    // Using iRacing methods through browser, fetch pages of members until exhausted
    let results = [], members = [];
  	do {
  		results = await page.evaluate(({ start, limit, leagueid }) => {
  			return new Promise((resolve, reject) => {
  				load(
  					contextpath + "/member/GetLeagueMembers", 
  					{ 
  						leagueid, 
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
  		}, { start, limit, leagueid: league_id });
  		
  		members = members.concat(results);
  		start += results.length;
  		
  	} while (results.length === limit);
    
    return members;

  },
  getDriverId: async (name, page) => {
    
    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto driver search page with name in query
  	await page.goto(
      `https://members.iracing.com/membersite/member/myracers.jsp?drivername=${encodeURIComponent(name)}`, 
      { timeout: 60000, waitUntil: 'networkidle2' }
    );
    
    // Parse page for first matching custId
    const [custId] = await page.$$eval(
      '#searchTable a.stats_table_link', 
      elements => elements.map(cell => cell.href.split('=').pop())
    );

    return custId;

  },
  inviteDriver: async (custid, leagueid, page) => {

    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto league home page
  	await page.goto(`https://members.iracing.com/membersite/member/LeagueView.do?league=${leagueid}`);

    // Use iRacing methods to remove driver from league
  	return page.evaluate(({ custid, leagueid }) => {
			return new Promise((resolve, reject) => {
        load(
          contextpath + "/member/SendLeagueRequest", 
          { custid, leagueid }, 
          (req) => {
            return function() {
              if (req.readyState == 4) {
                if (req.status == 200) return resolve(req.status);  
                else reject(req.status);              
              }
            }
          }
        );
      });
    }, { custid, leagueid });

  },
  removeDriver: async (custid, leagueid, page) => {
    
    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto league home page
  	await page.goto(`https://members.iracing.com/membersite/member/LeagueView.do?league=${leagueid}`);

    // Use iRacing methods to remove driver from league
  	return page.evaluate(({ custid, leagueid }) => {
			return new Promise((resolve, reject) => {
				$.ajax({
					"url": contextpath+"/member/RemoveLeagueMember",
					"data": { custid, leagueid },
					"type": "post"
				}).success(function(res) {
					resultsData = extractJSON(decodeAllFields(res));
					// Was successful
					if (Number(resultsData) == 1)
            resolve(true);
					else
            resolve(false);
				}).fail(function() { reject(false); });
			});
		}, { custid, leagueid });

  },
  updateDriver: async(valueName, theValue, memberID, leagueID, page) => {

    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto league home page
  	await page.goto(`https://members.iracing.com/membersite/member/LeagueView.do?league=${leagueID}`);

    // Use iRacing methods to remove driver from league
  	return page.evaluate(({ valueName, theValue, memberID, leagueID }) => {
			return new Promise((resolve, reject) => {
        load(
          contextpath + "/member/UpdateLeagueMember" + valueName, 
          { memberID, leagueID, theValue }, 
          function(req) {
            return function() {
              if (req.readyState == 4) {
                if (req.status == 200) resolve();
                else reject();
              }
            }
        });
			});
		}, { valueName, theValue, memberID, leagueID });
    
  }
}