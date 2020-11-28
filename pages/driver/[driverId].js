import Head from 'next/head'
import { createClient } from 'contentful'
import Navbar from '../../components/Navbar';

const client = createClient({
  space: '38idy44jf6uy',
  environment: 'master',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Driver(props) {
  return (
  	<div>
  	  <Head>
    		<title>Output Racing | {props.nickname || props.name}</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>
      
      <Navbar/>
  
  	  <main className="container">

        <div className="columns">   
          <div className="col-8 col-mx-auto">

            <div className="columns" style={{ display: "flex", alignItems: "center" }}>
              { props.numberArt &&
                  <div className="column col-6">
                    <img src={ props.numberArt.fields.file.url } style={{ display: "block", width: "200px", margin: "0 20px 0 auto" }}/>
                  </div>
              }
              <div className="column col-6 col-mx-auto">
                <h2>{props.nickname || props.name}</h2>
                { props.license &&
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    <li><span style={{ backgroundColor: `#${props.license.licColor}`, color: props.license.licGroup === 3 ? 'black' : 'white', padding: "4px 8px", borderRadius: "4px" }}> {props.license.licGroupDisplayName} <span style={{ marginLeft: "4px" }}>{props.license.srPrime}.{props.license.srSub}</span></span></li>
                    <li><span style={{ border: "1px solid black", padding: "4px 8px", borderRadius: "4px" }}>iRating <span style={{ marginLeft: "4px" }}>{props.license.iRating}</span></span></li>
                  </ul>
                }
              </div>
            </div>

            { props.careerStats &&
              <>
                <h4 className="text-center" style={{ marginTop: "3rem" }}>iRacing Career Stats</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Starts</th>
                      <th>Wins</th>
                      <th>Top 5s</th>
                      <th>Poles</th>
                      <th>Avg Start</th>
                      <th>Avg Finish</th>
                      <th>Total Laps</th>
                      <th>Laps Led</th>
                      <th>Inc/Race</th>
                      <th>Win %</th>
                      <th>Top 5 %</th>
                      <th>Led %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{props.careerStats.starts}</td>
                      <td>{props.careerStats.wins}</td>
                      <td>{props.careerStats.top5}</td>
                      <td>{props.careerStats.poles}</td>
                      <td>{props.careerStats.avgStart}</td>
                      <td>{props.careerStats.avgFinish}</td>
                      <td>{props.careerStats.totalLaps}</td>
                      <td>{props.careerStats.lapsLed}</td>
                      <td>{props.careerStats.avgIncPerRace.toFixed(2)}</td>
                      <td>{props.careerStats.winPerc.toFixed(0)}%</td>
                      <td>{props.careerStats.top5Perc.toFixed(0)}%</td>
                      <td>{props.careerStats.lapsLedPerc.toFixed(0)}%</td>
                    </tr>
                  </tbody>
                </table>
              </>
            }
            
            { props.seasonStats &&
                props.seasonStats.map((season, index) => (
                  <div key={`stats${index}`} style={{ marginTop: "3rem" }}>
                    <h4 className="text-center" style={{ marginBottom: "1rem" }}>{season.name} Stats</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Starts</th>
                          <th>Wins</th>
                          <th>Top 5s</th>
                          <th>Poles</th>
                          <th>Avg Start</th>
                          <th>Avg Finish</th>
                          <th>Total Laps</th>
                          <th>Laps Led</th>
                          <th>Inc/Race</th>
                          <th>Win %</th>
                          <th>Top 5 %</th>
                          <th>Led %</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{season.starts}</td>
                          <td>{season.wins}</td>
                          <td>{season.top5s}</td>
                          <td>{season.poles}</td>
                          <td>{season.avgStart}</td>
                          <td>{season.avgFinish}</td>
                          <td>{season.laps}</td>
                          <td>{season.lapsLed}</td>
                          <td>{season.incidentsRace}</td>
                          <td>{season.winPercentage}</td>
                          <td>{season.top5Percentage}</td>
                          <td>{((parseInt(season.lapsLed) / parseInt((season.laps || '0').replace(',',''))) * 100).toFixed(0)}%</td>
                        </tr>
                      </tbody>
                    </table>            
                  </div>
                ))
            }
        
          </div>
        </div>

  	  </main>

  	</div>
  )
}

export async function getStaticPaths() {
  const entries = await client.getEntries({ content_type: 'driver', limit: 500 });
  return {
    paths: entries.items.map(entry => ({ params: { driverId: entry.sys.id }})),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const entry = await client.getEntry(params.driverId);
  const seasons = await client.getEntries({ content_type: "season" });
  const seasonStats = seasons.items
    .filter(({ fields }) => fields.stats.find(({ driver }) => driver === entry.fields.name))
    .map(({ fields }) => {
      return {
        name: fields.name,
        ...fields.stats.find(({ driver }) => driver === entry.fields.name)
      }
    });
  return { props: { ...entry.fields, seasonStats }};
};
