const league = require(`${process.cwd()}/lib/league`);
const iracing = require(`${process.cwd()}/lib/iracing`);
const { isAuthorized } = require('../lib/authorization');
const { getApplicants } = require('../lib/applications');

module.exports = {
	name: 'link',
	description: 'Link Discord ID to driver profile, or link the mentioned user.',
  args: true,
  usage: '<iRacing ID> [@<user>]',
	execute: async (message, args) => {

    // Exit if trying to assign without authorization
    if (message.mentions.users.size > 0 && !isAuthorized(message.author, message.channel))
      return message.reply('linking someone other than yourself is for admins only.');

    // Ensure dependencies are initialized
    await league.init();

    // Find driver matching current car number
    let driver = await league.drivers.find(
      driver => driver.custId == args[0]
    );
    
    let props = {};
    
    if (!driver) {
      const applicants = await getApplicants();
      
      const applicant = applicants.find(applicant => applicant.custId == args[0]);
      
      if (!applicant) return message.reply("I can't find that iRacing ID. Try again.");
      
      // Create or update driver entry with discordId
      driver = await league.mapDriver(applicant.Name);

      // Get license and stats from iRacing
      // TODO: This should be common, like scrapers/driver
      const { license, stats } = await iracing.getCareerStats(args[0]);

      // Set props to save for driver
      props = { 
        custId: parseInt(args[0], 10),
        active: true, 
        license, 
        careerStats: stats 
      };
    }

    // Set discordId for matched driver
    await driver.put({
      ...props, 
      discordId: message.mentions.users.size > 0 
        ? message.mentions.users.firstKey()
        : message.author.id 
    });

//     console.log({
//       ...props, 
//       discordId: message.mentions.users.size > 0 
//         ? message.mentions.users.firstKey()
//         : message.author.id 
//     });
// 
    message.react('👍');

	},
};