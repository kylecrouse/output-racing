module.exports = {
  getStandings: async (season_id, session) => {

    await session.goto(`http://www.simracerhub.com/scoring/season_standings.php?season_id=${season_id}`);
    
    return session.$$eval('#driver_table tr:not(.jsTableHdr)', (rows) => {
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText);
        return {
          position: cells[0],
          change: cells[1],
          driver: cells[2],
          starts: cells[3],
          provisionals: cells[4],
          racesCounted: cells[5],
          wins: cells[6],
          t5s: cells[7],
          t10s: cells[8],
          points: cells[9],
          bonus: cells[10],
          penalty: cells[11],
          laps: cells[12],
          incidents: cells[13],
          behindLeader: cells[14],
          behindNext: cells[15],
        }
      })
    });

  }
}