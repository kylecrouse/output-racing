import Head from 'next/head'
import league from '../../lib/league/cache';
import moment from 'moment';
import Navbar from '../../components/Navbar';

export default function Driver(props) {
  return (
  	<div>
  	  <Head>
    		<title>{props.leagueName} | {props.nickname || props.name}</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>
      
      <Navbar seasonId={props.seasonId}/>
      
      <style jsx>{`
        th {
          width: 8.33%;
        }
      `}</style>

  
  	  <main className="container">

        <div className="columns">   
          <div className="column col-8 col-xl-12 col-mx-auto">

            <div className="columns" style={{ display: "flex", alignItems: "center" }}>
              <div className="column col-6">
                { props.numberArt &&
                    <img src={ props.numberArt.fields.file.url } style={{ display: "block", width: "200px", margin: "0 20px 0 auto" }}/>
                }
              </div>
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
            
            { props.media && 
                <div style={{ marginTop: "2rem" }}>
                  { props.media.slice(-1).map(image => renderImage(image)) }
                </div>
            }
            


            { props.careerStats &&
              <>
                <h4 className="text-center" style={{ margin: "3rem 0 1.5rem" }}>iRacing Career Stats</h4>
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
            
            { Object.keys(props.leagueStats).length > 0 &&
              <>
                <h4 className="text-center" style={{ margin: "3rem 0 1.5rem" }}>{props.leagueName} Career Stats</h4>
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
                      <td>{props.leagueStats.starts}</td>
                      <td>{props.leagueStats.wins}</td>
                      <td>{props.leagueStats.top5s}</td>
                      <td>{props.leagueStats.poles}</td>
                      <td>{props.leagueStats.avgStart}</td>
                      <td>{props.leagueStats.avgFinish}</td>
                      <td>{props.leagueStats.laps}</td>
                      <td>{props.leagueStats.lapsLed}</td>
                      <td>{props.leagueStats.incidentsRace}</td>
                      <td>{props.leagueStats.winPercentage}</td>
                      <td>{props.leagueStats.top5Percentage}</td>
                      <td>{((parseInt(props.leagueStats.lapsLed.replace(',','')) / parseInt((props.leagueStats.laps || '0').replace(',',''))) * 100).toFixed(0)}%</td>
                    </tr>
                  </tbody>
                </table>
              </>
            }
            
            { props.seasonStats.length > 0 &&
                <>
                  <h4 className="text-center" style={{ margin: "3rem 0 -.5rem" }}>{props.leagueName} Season Stats</h4>
                  { props.seasonStats.map((season, index) => (
                      <div key={`stats${index}`}>
                        <h6 className="text-center" style={{ margin: "2rem 0 1.5rem" }}>{season.name}</h6>
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
                </>
            }
        
          </div>
        </div>

  	  </main>

  	</div>
  )
}

export async function getStaticPaths() {
  const { drivers } = await league.load();
  return {
    paths: drivers
      .filter(driver => driver.active)
      .map(driver => ({ params: { 
        driverName: driver.name.replace(/\s/g, '-').toLowerCase()
      }})),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const { name, season, seasons, drivers } = await league.load();

  const driver = drivers.find(driver => 
    driver.name.toLowerCase() === params.driverName.replace(/-/g, ' ').toLowerCase()
  );

  return { props: { 
    ...driver, 
    leagueName: name,
    seasonId: season.id, 
    seasonStats: seasons
      .filter(({ stats }) => stats.find(item => item.driver === driver.name))
      .sort((a, b) => moment(b.schedule[0].date).diff(a.schedule[0].date))
      .map(season => ({
        name: season.name,
        ...season.stats.find(item => item.driver === driver.name)
      }))
  }};
};

function renderImage(image) {
  if (image && image.fields.file) {
    return <img src={ image.fields.file.url } style={{ width: "100%", marginBottom: "2rem" }} />
  } else {
    return null
  }
}
