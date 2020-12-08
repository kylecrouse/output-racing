const { waitForAuthentication } = require('./auth');

module.exports = {
  getLatestResults: async (league_id, page) => {
  
    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto league home page
  	await page.goto(`https://members.iracing.com/membersite/member/LeagueView.do?league=${league_id}`);

    // Extract the subsession ID of the latest league race
    // TODO: Test to ensure has valid race session
  	const subSessionId = '36092604'/*await page.evaluate(
      () => window.LeagueViewPage.GlobalSeasonsData.r[0].previousrace[0].subsessionid
    );*/

    // Goto the event results page for the subsession
  	await page.goto(`https://members.iracing.com/membersite/member/EventResult.do?&subsessionid=${subSessionId}`);

    // Return the source of the results page
    return page.content();

  }
}