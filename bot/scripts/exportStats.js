const fs = require('fs');
const league = require('../../lib/league');
const { getApplicants, getPending } = require('../lib/applications');
const columns = ['mem','ir','sr','lic','start','win','t5','finish','lap','inc'];
let csv = [columns];

async function exportStats(test = false) {
  
  try {
    await league.init();
    
    if (!test) {
      
      const drivers = league.drivers
        .filter(driver => driver.license && driver.careerStats)
        .map(driver => {
          const { iRating, srPrime, srSub, licGroup } = driver.license;
          const { starts, winPerc, top5Perc, avgFinish, totalLaps, avgIncPerRace } = driver.careerStats;
          
          return {
            mem: 1,
            ir: iRating,
            sr: parseFloat(`${srPrime}.${srSub}`),
            lic: licGroup,
            start: starts,
            win: winPerc,
            t5: top5Perc,
            finish: avgFinish,
            lap: totalLaps,
            inc: avgIncPerRace
          };
        });
        
      const applicants = await getApplicants();
      
      const merged = drivers.concat(applicants
        .filter(applicant => !league.drivers.find(driver => driver.name === applicant.Name))
        .filter(applicant => applicant.custId && applicant.Approved != 'PENDING')
        .map(applicant => ({
          mem: (applicant.Approved == 'YES' || applicant.Approved == 'KICKED') ? '1' : '0',
          ir: applicant.iR,
          sr: applicant.SR,
          lic: applicant.LicenseGroup,
          start: applicant.Starts,
          win: parseFloat(applicant.Wins),
          t5: parseFloat(applicant['Top 5s']),
          finish: applicant.AvgFinish,
          lap: applicant.TotalLaps,
          inc: applicant.Inc
        }))
      )
      
      for (driver of merged)
        csv.push(columns.map(column => driver[column] || ''));

    }
    else {
      const applicants = await getPending();

      applicants
        .filter(applicant => applicant.custId)
        .map(applicant => ({
          mem: '0',
          ir: applicant.iR,
          sr: applicant.SR,
          lic: applicant.LicenseGroup,
          start: applicant.Starts,
          win: parseFloat(applicant.Wins),
          t5: parseFloat(applicant['Top 5s']),
          finish: applicant.AvgFinish,
          lap: applicant.TotalLaps,
          inc: applicant.Inc
        }))
        .forEach(
          driver => csv.push(columns.map(column => driver[column] || ''))
        );
      
    }
    
    await fs.promises.writeFile('drivers.csv', csv.join('\n'));
    
  }
  catch(err) {
    console.log(err);
  }
  
}

return exportStats(process.argv[2]);