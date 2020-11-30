import Head from 'next/head'
import { createClient } from 'contentful'
import moment from 'moment';
import Navbar from '../../components/Navbar'
import DriverChip from '../../components/DriverChip'
import { leagueId, cars } from '../../constants'

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_WEB_ACCESS_TOKEN
})

export default function Schedule(props) {
  return (
	  <div>
  	  <Head>
    		<title>{props.league.name} | {props.name}</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>

      <Navbar seasonId={props.league.activeSeason.sys.id}/>
      
	    <main className="container">
	  	  <div className="columns">
          <div className="column col-8 col-mx-auto">

          	<h2 className="text-center">{props.name} Schedule</h2>
            
            { props.cars && 
                <div className="columns col-gapless" style={{ margin: "2rem 0" }}>
                  { props.cars.map(name => {
                      const car = cars.find(car => car.name === name);
                      return (
                        <figure key={car.id} className={`col-${(12/props.cars.length).toFixed(0)} col-mx-auto text-center`}>
                          <img src={car.image} alt={car.name} style={{ maxHeight: "150px", maxWidth: "100%" }}/>
                          <figcaption style={{ fontSize: "0.6rem" }}>{car.name}</figcaption>
                        </figure>
                      );
                    })
                  }
                </div>
            }

        		<table>
              <thead>
                <tr>
                  <th width="12%">Date</th>
                  <th>Event</th>
                  <th width="40%">Track</th>
                  <th width="5%">Laps</th>
                </tr>
              </thead>
        		  <tbody>
          			{ props.schedule.filter(({ raceNo }) => raceNo !== "").map((race) => (
              		  <tr key={props.raceNo}>
                      <td>{moment(race.date).format('MMM D, YYYY')}</td>
                			<td>
                        { race.raceId 
                            ? <a href={`/race/${race.raceId}/`}>{race.name}</a>
                            : race.name
                        }
                      </td>
                			<td>{race.track}</td>
                      <td>{race.laps}</td>
              		  </tr>
              		)) 
          			}
        		  </tbody>
        		</table>
            
            <h3 style={{ marginTop: "3rem" }}>Other Seasons</h3>

        		<table>
              <thead>
                <tr>
                  <th></th>
                  <th width="20%">1st</th>
                  <th width="20%">2nd</th>
                  <th width="20%">3rd</th>
                </tr>
              </thead>
        		  <tbody>
          			{ props.seasons.map(season => (
              		  <tr key={season.id}>
                      <td><a href={`/schedule/${season.id}/`}>{season.name}</a></td>
                			<td>
                        <DriverChip {...season.standings[0].driver}/>
                      </td>
                			<td>
                        <DriverChip {...season.standings[1].driver}/>
                      </td>
                			<td>
                        <DriverChip {...season.standings[2].driver}/>
                      </td>
              		  </tr>
              		)) 
          			}
        		  </tbody>
        		</table>
            
          </div>
        </div>
		  
	  </main>

	</div>
  )
}

export async function getStaticPaths() {
  const entries = await client.getEntries({ content_type: 'season' });
  return {
  	paths: entries.items.map(entry => ({ params: { seasonId: entry.sys.id }})),
  	fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const leagues = await client.getEntries({ 
    content_type: 'league', 
    'sys.id': leagueId, 
    include: 2 
  });
  const seasons = leagues.items[0].fields.seasons;
  const season = seasons.find(season => season.sys.id === params.seasonId);
  const drivers = await client.getEntries({ content_type: "driver", limit: 500 });
  return { props: { 
    league: leagues.items[0].fields,
    ...season.fields,
    schedule: season.fields.schedule.map((schedule) => {
      const race = season.fields.results.find(({ sys }) => sys.id === schedule.raceId);
      return race ? { ...schedule, ...race.fields } : schedule;
    }), 
    drivers: drivers.items,
    seasons: seasons
      .filter(season => season.sys.id !== params.seasonId)
      .sort((a, b) => moment(b.fields.schedule[0].date).diff(a.fields.schedule[0].date))
      .map(season => ({
        id: season.sys.id,
        name: season.fields.name,
        standings: season.fields.standings
          .filter(record => parseInt(record.position) <= 3)
          .sort((a, b) => parseInt(a.position) - parseInt(b.position))
          .map(record => ({
            ...record,
            driver: drivers.items.find(driver => driver.fields.name === record.driver)
          }))
      }))
  }};
};
