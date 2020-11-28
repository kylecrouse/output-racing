import Head from 'next/head'
import { createClient } from 'contentful'
import moment from 'moment';
import Navbar from '../../components/Navbar'
import DriverChip from '../../components/DriverChip'
import { cars } from '../../constants'

const client = createClient({
  space: '38idy44jf6uy',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Schedule(props) {
  return (
	  <div>
  	  <Head>
    		<title>Output Racing | {props.name}</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>

      <Navbar/>
      
	    <main className="container">
	  	  <div className="columns">
          <div className="column col-8 col-mx-auto">

          	<h2>{props.name}</h2>
            
            { props.cars && 
                <div className="columns col-gapless" style={{ margin: "2rem 0" }}>
                  { props.cars.map(name => {
                      const car = cars.find(car => car.name === name);
                      return (
                        <figure key={car.id} className={`col-${(12/props.cars.length).toFixed(0)} col-mx-auto text-center`}>
                          <img src={car.image} alt={car.name} style={{ width: "100%" }}/>
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
                  <th>Date</th>
                  <th>Event</th>
                  <th>Track</th>
                  <th>Laps</th>
                </tr>
              </thead>
        		  <tbody>
          			{ props.schedule.filter(({ raceNo }) => raceNo !== "").map((race) => (
              		  <tr key={props.raceNo}>
                      <td>{moment(race.date).format('MMM D, YYYY')}</td>
                			<td>
                        { race.raceId 
                            ? <a href={`/race/${race.raceId}.html`}>{race.name}</a>
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
                  <th>Champion</th>
                </tr>
              </thead>
        		  <tbody>
          			{ props.seasons.map(season => (
              		  <tr key={season.sys.id}>
                      <td><a href={`/schedule/${season.sys.id}.html`}>{season.fields.name}</a></td>
                			<td>
                        <DriverChip {...props.drivers.find(driver => driver.fields.name === season.fields.standings.find(driver => driver.position === '1').driver)}/>
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
  const seasons = await client.getEntries({ content_type: 'season' });
  const season = seasons.items.find(season => season.sys.id === params.seasonId);
  const races = await client.getEntries({ content_type: "race", limit: 500 });
  const drivers = await client.getEntries({ content_type: "driver", limit: 500 });
  return { props: { 
    ...season.fields,
    schedule: season.fields.schedule.map((schedule) => {
      const race = races.items.find(({ sys }) => sys.id === schedule.raceId);
      return race ? { ...schedule, ...race.fields } : schedule;
    }), 
    drivers: drivers.items,
    seasons: seasons.items
      .filter(season => season.sys.id !== params.seasonId)
      .sort((a, b) => moment(b.fields.schedule[0].date).diff(a.fields.schedule[0].date))
  }};
};
