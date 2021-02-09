import moment from 'moment'
import { createClient } from 'contentful'
import { leagueId, tracks } from '../../constants'
import { getSecretValue } from '../secrets';

let league = null;

function proxy(target) {
  return new Proxy(target, {
    get: (target, prop) => {
      // console.log({target,prop});
      // Return own prop if defined
      if (prop in target)
        return target[prop];
      // Try to resolve prop to fields
      if (prop in target.fields)
        return target.fields[prop];
      // Try to resolve to sys (for id)
      if (prop in target.sys)
        return target.sys[prop];
      // Nothing found for prop
      return undefined;
    }
  });
}

function normalizeSeason(season, drivers) {
  
  // Map drivers on to the season's standings
  season.fields.standings = season.fields.standings
    .sort((a, b) => a.position - b.position)
    .map(item => ({
      ...item, 
      driver: drivers.find(driver => driver.name === item.driver) || null
    }));

  // Map drivers and schedule on to season results
  if (season.fields.results) {
    season.fields.results = season.fields.results.map(item => {
      const schedule = season.fields.schedule.find(race => race.raceId == item.fields.raceId);
      return {
        id: item.sys.id,        
        ...schedule,
        ...item.fields,
        track: tracks.find(({ name }) => schedule.track.match(name)),
        results: item.fields.results
          .sort((a, b) => a.finish - b.finish)
          .map(item => ({ 
            ...item, 
            driver: drivers.find(driver => driver.id === item.id) || null
          }))
      };
    });
  }
  
  // Get the next race for season
  const [nextRace = null] = season.fields.schedule
    .filter(race => !race.offWeek && !race.uploaded)
    .map(item => ({
      ...item,
      track: tracks.find(({ name }) => item.track.match(name)) || { logo: null, name: item.track },
    }))
    .sort((a, b) => moment(a.date).diff(b.date));

  // Get the previous race for the season
  let [lastRace = null] = season.fields.schedule
    .filter(race => 
      !race.offWeek 
        && race.uploaded 
        && moment().isSameOrAfter(race.date, 'day')
    )
    .sort((a, b) => moment(b.date).diff(a.date));
    
  // Amend other data fields to last race
  if (lastRace) {
    lastRace = {
      ...lastRace,
      ...season.fields.results.find(race => race.raceId == lastRace.raceId),
    };
  }
  
  return {
    id: season.sys.id,
    ...season.fields,
    results: season.fields.results 
      ? season.fields.results.map(item => ({ 
        ...item, 
        driver: drivers.find(driver => driver.id === item.id) || null
      }))
      : null,
    nextRace,
    lastRace
  };
}

export default {
  load: async () => {
    
    if (league)
      return league;
    
    else {  
      // Get Contentful access token
      const { accessToken } = await getSecretValue('ORLBot/ContenfulDeliveryAPI')
      
      // Initialize client
      const client = createClient({
        space: process.env.CONTENTFUL_SPACE_ID,
        accessToken
      });

      // Get league
      [league] = await client.getEntries({ 
        content_type: 'league', 
        'sys.id': leagueId, 
        include: 2
      }).then(entries => entries.items);
      
      // Get all drivers
      const drivers = await client.getEntries({ 
        content_type: "driver", 
        limit: 500,
        include: 2
      }).then(entries => entries.items)
        .then(drivers => drivers.map(item => ({ 
          id: item.sys.id, 
          ...item.fields,
          leagueStats: league.fields.stats.find(
            ({ driver }) => driver === item.fields.name
          ) || {}
        })));
        
      // Normalize each season
      const seasons = league.fields.seasons.map(
        season => normalizeSeason(season, drivers)
      );
      
      // Create consolidated data model
      league = {
        id: league.sys.id,
        ...league.fields,
        season: seasons.find(season => season.id === league.fields.activeSeason.sys.id),
        seasons,
        drivers
      };
  
      return league;
    }
  }
}

