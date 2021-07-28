module.exports = {
  getStats: async (type, id, session) => {

    await session.goto(`http://www.simracerhub.com/scoring/league_stats.php?${type}=${id}`);
    
    // const [name, stats] = await Promise.all([
      // session.$eval('.pageTitleRight', el => el.innerHTML.replace(/<br>/g, ' ')),
    return session.evaluate(() => {
      const sel = document.querySelector('#page_controls select');
      if (!sel) return [];
      sel.selectedIndex = sel.options.length - 1;
      setPagesize(sel);
      return Array.from(document.querySelectorAll('#stat_table tbody tr')).map(row => {
        const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText);
        return {
          driver: cells[1],
          races: cells[2],
          starts: cells[3],
          provisionals: cells[4],
          poles: cells[5],
          polePercentage: cells[6],
          avgStart: cells[7],
          wins: cells[8],
          winPercentage: cells[9],
          avgFinish: cells[10],
          top5s: cells[11],
          top5Percentage: cells[12],
          top10s: cells[13],
          top10Percentage: cells[14],
          laps: cells[15],
          lapsLed: cells[16],
          miles: cells[17],
          incidents: cells[18],
          incidentsRace: cells[19],
          incidentsLap: cells[20]
        };
      });
    });
    // ]);
    
    // return { name, stats };

  }
}