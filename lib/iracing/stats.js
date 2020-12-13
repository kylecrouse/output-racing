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
    
    const [license, stats] = await Promise.all([
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
  		}, custid)
    ]);
    
    return { license, stats };

  }
}