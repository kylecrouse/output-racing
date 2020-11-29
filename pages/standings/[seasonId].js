import Head from 'next/head'
import { createClient } from 'contentful'
import moment from 'moment';
import Navbar from '../../components/Navbar'
import DriverChip from '../../components/DriverChip'
import { leagueId } from '../../constants'

const client = createClient({
  space: '38idy44jf6uy',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Schedule(props) {
  return (
  	<div>
  	  <Head>
    		<title>{props.league.name} | Standings</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>

      <Navbar seasonId={props.league.activeSeason.sys.id}/>
	    
      <main className="container">
	  	  <div className="columns">
          <div className="column col-8 col-mx-auto">
	
        		<h2 className="text-center">{props.name} Standings</h2>
            <h6 className="text-center" style={{ margin: "1rem 0 2rem" }}>After {props.completed} of {props.races} Races</h6>

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
                    props.standings
                      .map((driver, index) => (
                        <tr key={index} style={{opacity: driver.driver.fields.active ? 1 : 0.3}}>
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
  const entries = await client.getEntries({ content_type: 'season' });
  return {
	  paths: entries.items.map(entry => ({ params: { seasonId: entry.sys.id }})),
	  fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const league = await client.getEntry(leagueId);
  const seasons = league.fields.seasons;
  const season = seasons.find(season => season.sys.id === params.seasonId);
  const drivers = await client.getEntries({ content_type: "driver", limit: 500 });
  return { props: {
    league: league.fields,
    name: season.fields.name,
    races: season.fields.schedule.length,
    completed: season.fields.results.length,
    standings: season.fields.standings
      .map(record => {
        return { ...record, driver: drivers.items.find(driver => driver.fields.name === record.driver) };
      })
      .filter(record => record.driver !== undefined),
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
      })),
    drivers: drivers.items
  }};
};
