import Head from 'next/head'
import { createClient } from 'contentful'
import moment from 'moment';
import Navbar from '../../components/Navbar'
import DriverChip from '../../components/DriverChip'

const client = createClient({
  space: '38idy44jf6uy',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Schedule(props) {
  return (
  	<div>
  	  <Head>
    		<title>Output Racing | Standings</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>

      <Navbar/>
	    
      <main className="container">
	  	  <div className="columns">
          <div className="column col-8 col-mx-auto">
	
        		<h2>Standings</h2>

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
                        <tr style={{opacity: driver.driver.fields.active ? 1 : 0.3}}>
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
  const season = await client.getEntry(params.seasonId);
  const drivers = await client.getEntries({ content_type: "driver", limit: 500 });
  return { props: { 
    standings: season.fields.standings
      .map(record => {
        return { ...record, driver: drivers.items.find(driver => driver.fields.name === record.driver) };
      })
      .filter(record => record.driver !== undefined),
    seasons: seasons.items
      .filter(season => season.sys.id !== params.seasonId)
      .sort((a, b) => moment(b.fields.schedule[0].date).diff(a.fields.schedule[0].date)),
    drivers: drivers.items 
  }};
};
