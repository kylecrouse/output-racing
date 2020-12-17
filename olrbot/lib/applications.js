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
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDH2DbTWcEFRL2G\n3qM0ieYxWJQcZ01SPkS7uz5XTc2y+nPBRSUAQLbD/fSmNpOkClHYon0uyU4oAsSx\nwLtIBpiYAdgGed4yGayNZlfjeNenSL05OM9AeeUTvmlalLOnUEhwOpgm3HXbXIF1\nlRPYgjw6zB2azYZ090CsPsw/fOAF7nwibrzr0H3A7i/Wk9lbQv9KfSmMWvq8jBeh\nRXxyUDh3PKQs3ut5kiDdeGxn+t8fa/zZfQUrDmkdQINx4sAiAXhkjox2DdTskeqa\nKHM2SCQu/gqTBhPPNAP5mlU3ktQHKEOeslbgPCOBNhXeZnvw1uSkmt4etI9NDbR4\nbqe+LTV9AgMBAAECggEAKR0NfHI24FlZv3UusNic47KEOAq1kNGwLMoTA32Fb8iQ\nR2bs+44Uu6ITsp1ARwt7dpzJMbam7lrRcftDXEhFHOKmOYDZake3ZNi1BJ6ACVGQ\n4kSSeMKLEwKFpKW6hxWgbXxUgIwy7/fqR1Et5ck3UGZdQdN+EbKrWrRJq1cKtJVT\nzTX983JmK0F/acyi7sLAW7JChgy8PKCsc0MMol+MTEipiR8danqsSEmqFSX49rkc\naPRMIcQ2YVXD5l/+41ebwyDXJ6sS1wiV4BDj1FKOdgCLC5ljcQSsRgmc5OpKFjGc\nJcOPMYOGKJPr2TRYGGxqLB1syKXkHWA7GJMClrm/4QKBgQD852T5qJ5ED9vqtG7m\nQxOcNrhuN7vOvVYM4QnKup8JibesUBvep2r+JQ0Iy2jGCRkUuK5dTc5G4Cf1ECLt\nEyl6YmF3lZ06BZsxXTzrhXFzk545sHvaSYdfqqQryH+mE2JVZdCV8TUdGjggmIVv\n3njr7SIdRcYEkwuFFC9CD8sPYQKBgQDKSofn8mwyJpvOOGHWU3bnptnMdLXC3zvL\nLGTXbEMMpkoijfKlRbUaVpkrdd+p1lv2DJ6xPiP6R3XOtm8vegRliCcazPH0lOIn\nFLgTn2HNyz7pAp6/xepdHxBO/XYcxhwitI0cAmBENWLqITweUXFD950KMZM4/HxZ\ndiQec20nnQKBgQCPfL2mhEufNBxC8rJFBGOY6tcC+a4dowCyd+91TSK0Z6WFJ0JY\ntkYXAXB+v+GnEjxfrFSJbX6OadlhyhD2zztmS3EfRwyYgdvGSy8oNWLj/ynzczUh\n6TvcRFW23Z/G2xKcfxK0L9FBvMGBhOeYS/HxcW48i3zI1aDglU4mvg0ooQKBgDpQ\nOdU3INFkJ83OmwV5kfE9O9OgYTUHvOjYp0kiQEHJPd2wJZ5W9dnd1NGebRc8X84R\n3T0iuKRRLTilhm+dMN9D3GHxal4i/P5fDqE5dKwqRrxMsQ5/MwwdBEqA7idlRH8M\npRDJ7o47BYSQiBAFUi1Rl8d0ewgWYJI5aDgO9gxRAoGBANNGjmJ3Y1a1ySCek/QW\ntNRCjFpZEHenD27IAQY3UvYwFTguYnd9C5qS6/z/g/e2gTVjc7AzEV4y7qxD4ejP\nelWLXB1wbj/sj4Mh/HYZ6+37lsvHs4qyyXSqJ9ifGMEBuvJCum1OQ/dI6ZFHlCfM\nY0rxYHwMP9KZLAjTk5mtQf0N\n-----END PRIVATE KEY-----\n"//process.env.GOOGLE_PRIVATE_KEY,
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