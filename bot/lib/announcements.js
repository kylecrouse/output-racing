const { 
	getResultsEmbed, 
	getStandingsEmbed, 
	getUpcomingEmbed, 
	getIncidentsEmbed, 
	getAttendanceEmbed 
} = require('./embeds');

const { 
	resultsChannelId, 
	councilChannelId 
} = require('../config.json');

module.exports = {
	announceResults: async (message, league, race) => {

		// Get the results channel
		const channel = await message.client.channels.fetch(resultsChannelId);
		// Fetch and iterate messages in channel to remove previous bot messages
		await channel.messages.fetch({ limit: 5 }).then(
			// Delete messages from the bot
			messages => messages.size > 0 && 
				messages.filter(m => m.author.id === message.client.user.id)
					.map(m => m.delete())
		);
		// Send latest results
		channel.send(await getResultsEmbed(race));
		// Send season standings
		channel.send(getStandingsEmbed(league));
		// Send next race
		// NOTE: This was removed in favor of upcoming session, which won't be scheduled
		//       by this point. Consider reinstating, or using schedule command's embed.
		channel.send(getUpcomingEmbed(league));
		
		// Get Drivers' Council channel
		const council = message.client.channels.cache.get(councilChannelId);
		// Send incident report
		council.send(getIncidentsEmbed(league.season, league.drivers));
		// Send attendance report
		council.send(getAttendanceEmbed(league.season, league.drivers));
		
	}
};