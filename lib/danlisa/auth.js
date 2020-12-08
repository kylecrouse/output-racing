module.exports = {
  waitForAuthentication: async (page, uri) => {

  	await page.goto(`https://www.danlisa.com/scoring/login_form.php?returnto=${encodeURIComponent(uri)}`);
  	
  	const userField = await page.$('#driver_name');
  	await userField.focus();
  	await userField.type(process.env.DANLISA_USERNAME);
  	
  	const passwordField = await page.$('#driver_passwd');
  	await passwordField.focus();
  	await passwordField.type(process.env.DANLISA_PASSWORD);
  	
  	const loginButton = await page.$('input[type=button][value="Log In"]');
  	await loginButton.click();
  	
    return page.waitForResponse(`https://www.danlisa.com${encodeURI(uri)}`);
    
  }
}