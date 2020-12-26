import Head from 'next/head'
import league from '../../lib/league/cache';
import moment from 'moment';
import Navbar from '../../components/Navbar'
import DriverChip from '../../components/DriverChip'
import { cars } from '../../constants'

export default function Schedule(props) {
  return (
	  <div>
  	  <Head>
    		<title>{props.leagueName} | {props.name}</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>

      <Navbar seasonId={props.currentSeasonId}/>
      
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
                  <th width="13%">Date</th>
                  <th>Event</th>
                  <th width="42%">Track</th>
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
                        { !race.counts && <i style={{opacity:0.5}}> (non-points)</i>}
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
  const { seasons } = await league.load();
  return {
  	paths: seasons.map(season => ({ params: { seasonId: season.id }})),
  	fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const { name, season: currentSeason, seasons } = await league.load();
  const season = seasons.find(season => season.id === params.seasonId);

  return { props: { 
    leagueName: name,
    currentSeasonId: currentSeason.id,
    ...season,
    seasons,
  }};
};
