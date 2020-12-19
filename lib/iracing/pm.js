const { waitForAuthentication } = require('./auth');

module.exports = {
  send: async (custid, message, page) => {

    // Login to iRacing
    await waitForAuthentication(page);
    
    // Goto PM page on iRacing forum for member
  	await page.goto(
      `https://members.iracing.com/jforum/pm/sendTo/${custid}.page`, 
      { timeout: 60000, waitUntil: 'networkidle2' }
    );
    
  	const userField = await page.$('[name="subject"]');
  	await userField.focus();
  	await userField.type(message.subject);
  	
  	const passwordField = await page.$('textarea.message');
  	await passwordField.focus();
  	await passwordField.type(message.body);
  	
  	const button = await page.$('#btnSubmit');
  	await button.click();
  	
  	return page.waitForResponse('https://members.iracing.com/jforum/jforum.page');

  }
}