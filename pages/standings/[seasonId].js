import Head from 'next/head'
import league from '../../lib/league/cache';
import moment from 'moment';
import Navbar from '../../components/Navbar'
import DriverChip from '../../components/DriverChip'

export default function Schedule(props) {
  return (
  	<div>
  	  <Head>
    		<title>{props.leagueName} | Standings</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>

      <Navbar seasonId={props.currentSeasonId}/>
	    
      <main className="container">
	  	  <div className="columns">
          <div className="column col-8 col-mx-auto">
	
        		<h2 className="text-center">{props.name} Standings</h2>
            <h6 className="text-center" style={{ margin: "1rem 0 2rem" }}>After {props.results.filter(({ counts }) => counts).length} of {props.schedule.filter(({ counts }) => counts).length} Races</h6>

            <table>
              <thead>
                <tr>
                  <th width="2%"></th>
                  <th width="2%"></th>
                  <th>Driver</th>
                  <th width="7%">Starts</th>
                  <th width="7%">Points</th>
                  <th width="7%">Behind Next</th>
                  <th width="7%">Behind Leader</th>
                  <th width="7%">Wins</th>
                  <th width="7%">Top 5s</th>
                  <th width="7%">Top 10s</th>
                  <th width="7%">Total Laps</th>
                  <th width="7%">Incidents per&nbsp;Race</th>
                </tr>
              </thead>
              <tbody>
                { props.standings &&
                    props.standings.map((driver, index) => (
                      <tr key={index} style={{opacity: driver.driver.active ? 1 : 0.3}}>
                        <td><b>{index + 1}</b></td>
                        <td>
                        { parseInt(driver.change, 10) > 0
                            ? <span style={{color:"green"}}>&#9650;&nbsp;{driver.change.substr(1)}</span>
                            : parseInt(driver.change, 10) < 0
                              ? <span style={{color:"red"}}>&#9660;&nbsp;{driver.change.substr(1)}</span>
                              : ''
                        }
                        </td>
                        <td><DriverChip {...driver.driver}/></td>
                        <td>{driver.starts}</td>
                        <td>{driver.points}</td>
                        <td>{driver.behindNext}</td>
                        <td>{driver.behindLeader}</td>
                        <td>{driver.wins}</td>
                        <td>{driver.t5s}</td>
                        <td>{driver.t10s}</td>
                        <td>{driver.laps}</td>
                        <td>{(driver.incidents / driver.starts).toFixed(2)}</td>
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

console.log(season.results);
  return { props: {
    leagueName: name,
    currentSeasonId: currentSeason.id,
    ...season,
    seasons: seasons.filter(season => season.id !== params.seasonId)
  }};
};
