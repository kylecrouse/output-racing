const { getSecretValue } = require(`${process.cwd()}/lib/secrets`);

module.exports = {
  waitForAuthentication: async (page) => {

    const { username, password } = await getSecretValue('ORLBot/iRacing');

  	await page.goto('https://members.iracing.com/membersite/login.jsp');
  	
  	const userField = await page.$('[name="username"]');
  	await userField.focus();
  	await userField.type(username);
  	
  	const passwordField = await page.$('[name="password"]');
  	await passwordField.focus();
  	await passwordField.type(password);
  	
  	const button = await page.$('input.log-in');
  	await button.click();
  	
  	return page.waitForResponse('https://members.iracing.com/membersite/member/Home.do');
    
  }
}