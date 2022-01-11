const client = require('./discord');
const moment = require('moment');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const iracing = require(`${process.cwd()}/lib/iracing`);
const { isAuthorized } = require('./authorization');
const { applicationsChannelId } = require('../config.json');
const { getSecretValue } = require(`${process.cwd()}/lib/secrets`);
const { getApplicantEmbed } = require('../lib/embeds');
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

async function resolveApplicant(name = '', row) {
    // Get iRacing customer ID that matches submitted name
  const custId = await iracing.getDriverId(name.trim());
  
  if (!custId) return { custId: null };
  
  // Get member profile data for custId
  const { license = {}, stats = {}, memberSince, clubId } = await iracing.getCareerStats(custId);
  
  // Get the applications sheet
  const sheet = await getSheet('Applications');
  
  // Write retrieved data back to spreadsheet
  await sheet.loadCells(`A${row}:Y${row}`);
  
  // Get the cells to be updated
  const cellStatus = sheet.getCellByA1(`A${row}`);
  const cellRating = sheet.getCellByA1(`B${row}`);
  const cellStarts = sheet.getCellByA1(`K${row}`);
  const cellWin = sheet.getCellByA1(`L${row}`);
  const cellT5 = sheet.getCellByA1(`M${row}`);
  const cellLaps = sheet.getCellByA1(`N${row}`);
  const cellLed = sheet.getCellByA1(`O${row}`);
  const cellLicense = sheet.getCellByA1(`P${row}`);
  const cellSR = sheet.getCellByA1(`Q${row}`);
  const celliR = sheet.getCellByA1(`R${row}`);
  const cellInc = sheet.getCellByA1(`S${row}`);
  const cellCustId = sheet.getCellByA1(`T${row}`);
  const cellAvgFinish = sheet.getCellByA1(`V${row}`);
  const cellTotalLaps = sheet.getCellByA1(`W${row}`);
  const cellMemberSince = sheet.getCellByA1(`X${row}`);
  const cellLicenseGroup = sheet.getCellByA1(`Y${row}`);
  
  // Set new data for each cell
  cellStatus.value = !cellStatus.value ? 'PENDING' : cellStatus.value;
  cellStatus.textFormat = { bold: true };
  cellStatus.horizontalAlignment = 'CENTER';
  cellRating.value = `${(stats.avgIncPerRace || 0).toFixed(2)} inc / ${license.iRating} iR / ${license.licGroupDisplayName} / ${license.srPrime}.${license.srSub} SR`;
  cellStarts.value = stats.starts;
  cellWin.value = `${(stats.winPerc || 0).toFixed(2)}%`;
  cellT5.value = `${(stats.top5Perc || 0).toFixed(2)}%`;
  cellLed.value = `${(stats.lapsLedPerc || 0).toFixed(2)}%`;
  cellLaps.value = stats.totalLaps;
  cellLicense.value = license.licGroupDisplayName;
  cellSR.value = `${license.srPrime}.${license.srSub}`;
  celliR.value = license.iRating;
  cellInc.value = (stats.avgIncPerRace || 0).toFixed(2);
  cellCustId.value = custId;
  cellAvgFinish.value = (stats.avgFinish || 0).toFixed(2);
  cellTotalLaps.value = stats.totalLaps;
  cellMemberSince.value = memberSince;
  cellLicenseGroup.value = license.licGroup;
  
  // Save all cells back to spreadsheet
  await sheet.saveUpdatedCells();

  return { custId, license, stats, memberSince, clubId };
}

module.exports = {
  resolveApplicant,
  getUnresolved: async () => {
    const sheet = await getSheet('Applications');
    const rows = await sheet.getRows();
    return rows.filter(row => row.Approved == '' && !row.custId);
  },
  getApplicants: async () => {
  
    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    return sheet.getRows();
  },
  getPending: async (name) => {
    
    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    if (name)
      // Return the queried applicant (only the last one for dupes)
      return rows.filter(row => row.Approved === 'PENDING' && row.Name.toLowerCase() === name.toLowerCase()).pop();
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
    const row = rows.filter(row => row.Approved === 'YES' && row.Name.toLowerCase() === name.toLowerCase()).pop();
    
    if (!row) return false;
    
    // Change the approved value to NO
    row.Approved = "KICKED";
    row['Reason for approve / deny / kicked'] = reason || 'N/A';
    
    // Return promise for saving row
    return row.save();

  },
  accept: async (name, reason, code) => {

    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Find the latest application matching this name
    const row = rows.filter(row => row.Approved === 'PENDING' && row.Name.toLowerCase() === name.toLowerCase()).pop();
    
    if (!row) return false;
    
    // Change the approved value to NO
    row.Approved = "YES";
    row['Reason for approve / deny / kicked'] = reason || 'N/A';
    row.inviteCode = code;
    
    // Return promise for saving row
    return row.save();
    
  },
  reject: async (name, reason) => {
    
    // Get the applications sheet
    const sheet = await getSheet('Applications');
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Find the latest application matching this name
    const row = rows.filter(row => row.Approved === 'PENDING' && row.Name.toLowerCase() === name.toLowerCase()).pop();
    
    if (!row) return false;
    
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
    const row = rows.filter(row => row.Approved === 'YES' && row.Name.toLowerCase() === name.toLowerCase()).pop();
    
    if (!row) return false;
    
    // Remove the used invite code
    row.inviteCode = "";
    
    // Return promise for saving row
    return row.save();

  },
  handleApplication: async ({ namedValues, range }) => {
    try {
      const { custId, license, stats, memberSince } = await resolveApplicant(namedValues.Name[0], range.rowStart);
      
      const channel = await client.channels.cache.get(applicationsChannelId);
      
      await channel.send(
        custId
          ? getApplicantEmbed(namedValues, custId, license, stats, memberSince)
          : `**${namedValues.Name[0]}** applied but I couldn't get stats from iRacing.`
      );

    } catch(err) {
      console.log(err);
    }
  },
  resolveApplicant
}