const { getSecretValue } = require(`${process.cwd()}/lib/secrets`);

module.exports = {
  waitForAuthentication: async (page, uri) => {
    
    const { username, password } = await getSecretValue('ORLBot/DanLisaScoring');

  	await page.goto(`https://www.danlisa.com/scoring/login_form.php?returnto=${encodeURIComponent(uri)}`);
  	
  	const userField = await page.$('#driver_name');
  	await userField.focus();
  	await userField.type(username);
  	
  	const passwordField = await page.$('#driver_passwd');
  	await passwordField.focus();
  	await passwordField.type(password);
  	
  	const loginButton = await page.$('input[type=button][value="Log In"]');
  	await loginButton.click();
  	
    return page.waitForResponse(`https://www.danlisa.com${encodeURI(uri)}`);
    
  }
}