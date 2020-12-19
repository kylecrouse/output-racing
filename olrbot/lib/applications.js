const discord = require('discord.js');
const moment = require('moment');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const iracing = require(`${process.cwd()}/lib/iracing`);
const { isAuthorized } = require('./authorization');
const { applicationsChannelId } = require('../config.json');
const { getSecretValue } = require(`${process.cwd()}/lib/secrets`);
const REACTION_ACCEPT = '👍';
const REACTION_DENY = '👎';
const REACTION_KICK = '🥾';
const REACTION_SUCCESS = '✅';
const REACTION_FAILURE = '😢';

const doc = new GoogleSpreadsheet('1YwAKsEToADShutguF4tTztfg5gTsiFbRej5Yk4Tuj_4');

async function getSheet(title) {
  
  // Get Google credentials from AWS store  
  const { client_email, private_key } = await getSecretValue('ORLBot/GoogleServiceAccount').catch(err => console.log(err));
  
  // use service account creds
  await doc.useServiceAccountAuth({ client_email, private_key });
  
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
  getInvited: async () => {
    
    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Filter the rows for invited applications
    return rows.filter(row => row.Approved === 'YES' && row.inviteCode);

  },
  kick: async (name, reason) => {

    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Find the latest application matching this name
    const row = rows.filter(row => row.Name === name).pop();
    
    // Change the approved value to NO
    row.Approved = "KICKED";
    row['Reason for approve / deny / kicked'] = reason || 'N/A';
    
    // Return promise for saving row
    return row.save();

  },
  accept: async (name, reason) => {

    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Find the latest application matching this name
    const row = rows.filter(row => row.Name === name).pop();
    
    // Change the approved value to NO
    row.Approved = "YES";
    row['Reason for approve / deny / kicked'] = reason || 'N/A';
    
    // Return promise for saving row
    return row.save();
    
  },
  reject: async (name, reason) => {
    
    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Find the latest application matching this name
    const row = rows.filter(row => row.Name === name).pop();
    
    // Change the approved value to NO
    row.Approved = "NO";
    row['Reason for approve / deny / kicked'] = reason || 'N/A';
    
    // Return promise for saving row
    return row.save();
    
  },
  setAccepted: async (name) => {
    
    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Find the latest application matching this name
    const row = rows.filter(row => row.Name === name).pop();
    
    // Remove the used invite code
    row.inviteCode = "";
    
    // Return promise for saving row
    return row.save();

  },
  handleApplication: async (client, { namedValues, range }) => {
    try {
      // Get iRacing customer ID that matches submitted name
      const custId = await iracing.getDriverId(namedValues.Name[0]);
      
      // Get member profile data for custId
      const { license = {}, stats = {}, memberSince, clubId } = await iracing.getCareerStats(custId);
      
      // Get the applications sheet
      const sheet = await getSheet('Applications');
      
      // Write retrieved data back to spreadsheet
      await sheet.loadCells(`A${range.rowStart}:T${range.rowStart}`);
      
      // Get the cells to be updated
      const cellStatus = sheet.getCellByA1(`A${range.rowStart}`);
      const cellRating = sheet.getCellByA1(`B${range.rowStart}`);
      const cellStarts = sheet.getCellByA1(`K${range.rowStart}`);
      const cellWin = sheet.getCellByA1(`L${range.rowStart}`);
      const cellT5 = sheet.getCellByA1(`M${range.rowStart}`);
      const cellLaps = sheet.getCellByA1(`N${range.rowStart}`);
      const cellLed = sheet.getCellByA1(`O${range.rowStart}`);
      const cellLicense = sheet.getCellByA1(`P${range.rowStart}`);
      const cellSR = sheet.getCellByA1(`Q${range.rowStart}`);
      const celliR = sheet.getCellByA1(`R${range.rowStart}`);
      const cellInc = sheet.getCellByA1(`S${range.rowStart}`);
      const cellCustId = sheet.getCellByA1(`T${range.rowStart}`);
      
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