const parse = require('csv-parse');
const getExport = require('./lib/csv');

function parseSeason(csv) {
  return new Promise((resolve, reject) => {
    parse(csv, {
      relax_column_count: true,
      from_line: 1,
      to_line: 3,
      on_record: record => record[1]
    }, (err, output) => (err) ? reject(err) : resolve({ name: `${output[1]} ${output[2]}` }))
  });
}

function parseSchedule(csv, ids, events) {
  return new Promise((resolve, reject) => {
    parse(csv, {
      relax_column_count: true,
      columns: true,
      from_line: 4,
      on_record: (record, context) => ({
        raceNo: record['Race #'],
        scheduleId: ids.shift(),
        date: new Date(record['Race Date']),
        offWeek: record['Off Week'] === 'Yes',
        uploaded: record['Results Uploaded'] === 'Yes',
        counts: record['Points Count'] === 'Yes',
        raceId: record['Results Uploaded'] === 'Yes'
          ? events.shift()
          : null,
        name: record['Off Week'] !== 'Yes'
          ? record['Event Name']
            ? record['Event Name']
            : `Output Racing ${record['Track Type'] === 'Short Track' ? record['Laps'] : parseInt(record['Distance (Miles)'])}`
          : 'Off Week',
        track: record['Track'],
        type: record['Track Type'],
        time: record['Time'],
        laps: record['Laps'],
        distance: record['Distance (Miles)']
      })
    }, (err, output) => (err) ? reject(err) : resolve(output))
  })
}

module.exports = {
  getSchedule: async (season_id, session) => {

    await session.goto(`http://www.danlisa.com/scoring/season_schedule.php?season_id=${season_id}`);
    
    const events = await session.$$eval(
      '#sched_table [id^=sch_].bgGray a[href^="season_race.php"]', 
      cells => cells.map(cell => cell.href.split('=').pop())
    );
    
    const scheduleIds = await session.$$eval(
      '#sched_table tr[id^=sch_]', 
      cells => cells.map(cell => cell.id.replace(/sch_/, ''))
    );
  
    const csv = await getExport(
      `http://www.danlisa.com/scoring/season_schedule_export.php?season_id=${season_id}`, 
      session
    );
    
    const [meta, schedule] = await Promise.all([
      parseSeason(csv), 
      parseSchedule(csv, scheduleIds, events)
    ]);
    
    return { ...meta, schedule };

  }
}