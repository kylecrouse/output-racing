const discord = require('discord.js');
const moment = require('moment');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const iracing = require(`${process.cwd()}/lib/iracing`);
const { isAuthorized } = require('./authorization');
const { applicationsChannelId } = require('../config.json');

const REACTION_ACCEPT = '👍';
const REACTION_DENY = '👎';
const REACTION_KICK = '🥾';
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

const doc = new GoogleSpreadsheet('1YwAKsEToADShutguF4tTztfg5gTsiFbRej5Yk4Tuj_4');

async function getSheet(title) {
    // use service account creds
    console.log(process.env.GOOGLE_PRIVATE_KEY);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    
    // Load the league doc
    await doc.loadInfo();
    
    // Get the applications sheet
    return doc.sheetsByTitle[title];
}

module.exports = {
  getPending: async (name) => {
    
    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    if (name)
      // Return the queried applicant (only the last one for dupes)
      return rows.filter(row => row.Approved === 'PENDING' && row.Name === name).pop();
    else 
      // Filter the rows for pending applications
      return rows.filter(row => row.Approved === 'PENDING');
  },
  kick: async (name) => {

    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Find the latest application matching this name
    const row = rows.filter(row => row.Name === name).pop();
    
    // Change the approved value to NO
    row.Approved = "KICKED";
    
    // TODO: - Remove from league on iRacing?
    //       - Remove from Discord?
    //       - Mark driver as inactive in system?
    //       - What else? Welcome message somewhere?
    
    // Return promise for saving row
    return row.save();

  },
  accept: async (name) => {

    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Find the latest application matching this name
    const row = rows.filter(row => row.Name === name).pop();
    
    // Change the approved value to NO
    row.Approved = "YES";
    
    // TODO: - Invite to league on iRacing?
    //       - Invite to Discord (associate ID somehow and remove !link?)
    //       - Import driver to CMS?
    //       - What else? Welcome message somewhere?
    
    // Return promise for saving row
    return row.save();
    
  },
  reject: async (name) => {
    
    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Find the latest application matching this name
    const row = rows.filter(row => row.Name === name).pop();
    
    // Change the approved value to NO
    row.Approved = "NO";
    
    // TODO: Is anything else done on rejection?
    
    // Return promise for saving row
    return row.save();
    
  },
  handleApplication: async ({ namedValues, range }) => {
    try {
      // Get iRacing customer ID that matches submitted name
      const custId = await iracing.getDriverId(namedValues.Name[0]);
      
      // Get member profile data for custId
      const { license = {}, stats = {}, memberSince, clubId } = await iracing.getCareerStats(custId);
      
      // Get the applications sheet
      const sheet = await getSheet('Applications');
      
      // Write retrieved data back to spreadsheet
      await sheet.loadCells(`A${range.rowStart}:${range.rowStart}`);
      
      // Get the cells to be updated
      const cellStatus = sheet.getCell(0, 0);
      const cellRating = sheet.getCell(0, 1);
      const cellStarts = sheet.getCell(0, 10);
      const cellWin = sheet.getCell(0, 11);
      const cellT5 = sheet.getCell(0, 12);
      const cellLaps = sheet.getCell(0, 13);
      const cellLed = sheet.getCell(0, 14);
      const cellLicense = sheet.getCell(0, 15);
      const cellSR = sheet.getCell(0, 16);
      const celliR = sheet.getCell(0, 17);
      const cellInc = sheet.getCell(0, 18);
      const cellCustId = sheet.getCell(0, 19);
      
      // Set new data for each cell
      cellStatus.value = 'PENDING';
      cellRating.value = `${stats.avgIncPerRace.toFixed(2)} inc / ${license.iRating} iR / ${license.licGroupDisplayName} / ${license.srPrime}.${license.srSub} SR`;
      cellStarts.value = stats.starts;
      cellWin.value = `${stats.winPerc.toFixed(2)}%`;
      cellT5.value = `${stats.top5Perc.toFixed(2)}%`;
      cellLed.value = `${stats.lapsLedPerc.toFixed(2)}%`;
      cellLaps.value = stats.totalLaps;
      cellLicense.value = license.licGroupDisplayName;
      cellSR.value = `${license.srPrime}.${license.srSub}`;
      celliR.value = license.iRating;
      cellInc.value = stats.avgIncPerRace.toFixed(2);
      cellCustId.value = custId;
      
      // Save all cells back to spreadsheet
      await sheet.saveUpdatedCells();
      
      // Notify applications channel
      const embed = new discord.MessageEmbed()
      	.setTitle('League Application Received')
        .setDescription(`[${namedValues.Name[0]}](https://members.iracing.com/membersite/member/CareerStats.do?custid=${custId}) applied to the league.`)
        .addFields(
          Object.entries(namedValues).reduce((fields, [name, value]) => { 
            if (name !== "Name" && name !== "Email" && name !== "Timestamp" && name !== "Rules" && value[0])
              fields.push({ name, value: `\`${value[0]}\`` });
            return fields; 
          }, [])
        )
        .addField('Member Since', `\`${moment(memberSince, "DD-MM-YYYY").format('MMMM Do, YYYY')}\``)
      	.addFields(
          { name: 'License', value: `\`${license.licGroupDisplayName}\``, inline: true },
          { name: 'SR', value: `\`${license.srPrime}.${license.srSub}\``, inline: true },
          { name: 'iRating', value: `\`${(parseInt(license.iRating)/1000).toFixed(1)}k\``, inline: true },
          { name: 'Starts', value: `\`${stats.starts}\``, inline: true },
          { name: 'Inc/Race', value: `\`${stats.avgIncPerRace.toFixed(2)}\``, inline: true },
          { name: 'Laps', value: `\`${stats.totalLaps}\``, inline: true },
          { name: 'Win %', value: `\`${stats.winPerc.toFixed(2)}%\``, inline: true },
          { name: 'Top 5%', value: `\`${stats.top5Perc.toFixed(2)}%\``, inline: true },
          { name: 'Led %', value: `\`${stats.lapsLedPerc.toFixed(2)}%\``, inline: true },
      	)
      	.setTimestamp()
        
      client.channels.cache.get(applicationsChannelId).send(embed);
      
    } catch(err) {
      console.log(err);
    }
  }
}