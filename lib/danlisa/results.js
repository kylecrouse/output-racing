const fetch = require('node-fetch');
const parse = require('csv-parse');
const getExport = require('./lib/csv');

function parseRaceInfo(csv) {
  return new Promise((resolve, reject) => {
    parse(csv, {
      relax_column_count: true,
      from_line: 1,
      to_line: 11,
      on_record: record => record[1]
    }, (err, output) => {
      if (err) reject(err);
      else resolve({
        name: process.argv.length >= 4 ? process.argv[3] : 'Unsponsored',
        // league: output[0],
        // series: output[1],
        // season: output[2],
        date: new Date(output[3]),
        track: output[4],//tracks.find(track => output[4].indexOf(track.name) >= 0).id.toString(),
        laps: parseInt(output[5], 10),
        duration: output[6],
        cautions: parseInt(output[7], 10),
        cautionLaps: parseInt(output[8], 10),
        leadChanges: parseInt(output[9], 10),
        leaders: parseInt(output[10], 10)
      });
    })
  });
}

function parseResults(csv) {
  return new Promise((resolve, reject) => {
    parse(csv, {
      relax_column_count: true,
      columns: true,
      from_line: 12,
      on_record: (record, context) => ({
        name: record['Driver'],
        // car: record['Car'],
        start: record['Start'],
        finish: record['Finish'],
        interval: record['Interval'],
        points: record['Race Points'],
        bonus: record['Bonus Points'],
        penalty: record['Penalty Points'],
        completed: record['Laps Completed'],
        led: record['Laps Led'],
        fastest: record['Fastest Lap'],
        average: record['Average Lap'],
        incidents: record['Incidents'],
        status: record['Status']
      })
    }, (err, output) => err ? reject(err) : resolve(output)) 
  });
  
}

module.exports = {
  getResults: async (race_id, session) => {

    const csv = await getExport(
      `http://www.danlisa.com/scoring/season_race.php?race_id=${race_id}&csv=y`, 
      session
    );
    
    return Promise.all([parseRaceInfo(csv), parseResults(csv)])
      .then(([raceInfo, results]) => ({ ...raceInfo, results }));
    
  }
}