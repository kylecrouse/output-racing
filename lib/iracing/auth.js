module.exports = {
  waitForAuthentication: async (page) => {

  	await page.goto('https://members.iracing.com/membersite/login.jsp');
  	
  	const userField = await page.$('[name="username"]');
  	await userField.focus();
  	await userField.type(process.env.iRACING_USERNAME);
  	
  	const passwordField = await page.$('[name="password"]');
  	await passwordField.focus();
  	await passwordField.type(process.env.iRACING_PASSWORD);
  	
  	const button = await page.$('input.log-in');
  	await button.click();
  	
  	return page.waitForResponse('https://members.iracing.com/membersite/member/Home.do');
    
  }
}