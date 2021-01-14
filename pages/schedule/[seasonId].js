import Head from 'next/head'
import league from '../../lib/league/cache';
import moment from 'moment';
import Navbar from '../../components/Navbar'
import DriverChip from '../../components/DriverChip'
import RichText from '../../components/RichText';
import Footer from '../../components/Footer';
import { cars } from '../../constants'

export default function Schedule(props) {
  return (
	  <div>
  	  <Head>
    		<title>{props.leagueName} | {props.name}</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>

      <Navbar seasonId={props.currentSeasonId} page="schedule"/>
      
	    <main className="container">
	  	  <div className="columns">
          <div className="column col-8 col-xl-12 col-mx-auto">

          	<h2 className="text-center">{props.name} Schedule</h2>
            
            <div class="columns" style={{ margin: "2rem 0" }}>
              <div class="column col-6">
                { props.description && <RichText {...props.description}/> }
                <p>
                  <a href="/apply" className="btn btn-primary">Apply</a>
                </p>
              </div>
              { props.cars && 
                  <div class="column col-6">
                    { props.cars.map(name => {
                        const car = cars.find(car => car.name === name);
                        return (
                          <figure key={car.id} className={`text-center`} style={{ overflow: "hidden", margin: "0 0 1rem" }}>
                            <img src={car.image} alt={car.name} style={{ maxHeight: "150px", maxWidth: "102%", marginLeft: "-1%" }}/>
                            <figcaption style={{ fontSize: "0.6rem" }}>{car.name}</figcaption>
                          </figure>
                        );
                      })
                    }
                  </div>
              }
            </div>

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
                      <td style={{ whiteSpace: "nowrap" }}>{moment(race.date).format('MMM D, YYYY')}</td>
                			<td>
                        { race.raceId 
                            ? <a href={`/race/${race.raceId}/`}>{race.name}</a>
                            : race.name
                        }
                        { !race.counts && <i style={{opacity:0.5}}> (non-points)</i>}
                      </td>
                			<td style={{ whiteSpace: "nowrap" }}>{race.track}</td>
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
                  <th className="hide-sm" width="20%">2nd</th>
                  <th className="hide-sm" width="20%">3rd</th>
                </tr>
              </thead>
        		  <tbody>
          			{ props.seasons.map(season => (
              		  <tr key={season.id}>
                      <td><a href={`/schedule/${season.id}/`}>{season.name}</a></td>
                			<td>
                        <DriverChip {...season.standings[0].driver}/>
                      </td>
                			<td className="hide-sm">
                        <DriverChip {...season.standings[1].driver}/>
                      </td>
                			<td className="hide-sm">
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

    <Footer {...props}/>

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
    seasons: seasons.filter(season => season.id !== params.seasonId),
  }};
};
