import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { createClient } from 'contentful'
import moment from 'moment';
import Navbar from '../components/Navbar';
import Video from '../components/Video';
import DriverChip from '../components/DriverChip';
import { leagueId, tracks } from '../constants';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_WEB_ACCESS_TOKEN
})

export default function Home(props) {
  return (
    <div>
      <Head>
        <title>{props.league.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar seasonId={props.league.activeSeason.sys.id}/>
      
      <div className="container">
        
        <main className="columns">
          <div className="column col-8 col-mx-auto">
  
            <div className="columns">
              <div className="column col-7">
                <div className="panel">
                  <div className="panel-header">
                    <h6 className="panel-title">Last Race</h6>
                  </div>
                  <div className="panel-body">
                    { props.lastRace.broadcast &&
                      <Video src={props.lastRace.broadcast}/>
                    }
                    { props.lastRace.logo
                      ? ( <div className="columns col-gapless" style={{ alignItems: "center", margin: "1rem 0", position: "relative", left: "15px" }}>
                            <div className="column col-3 text-center">
                              <img src={ props.lastRace.logo.fields.file.url } style={{ display: "block", margin: "0 auto", maxHeight: "80px", height: "100%" }} />
                            </div>
                            <div className="column col-6 text-center" style={{ paddingLeft: "30px" }}>
                              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                                <li style={{ marginTop: 0, lineHeight: 1.2 }}><b>{props.lastRace.track}</b></li>
                                <li style={{ marginTop: 0 }}>{moment(props.lastRace.date).format('MMMM Do, YYYY')}</li>
                              </ul>
                            </div>
                            <div className="column col-3 text-center">
                              <img src={tracks.find(({ name }) => props.lastRace.track.indexOf(name) >= 0).logo} style={{ display: "block", margin: "0 auto", maxHeight: "80px", height: "100%" }}/>
                            </div>
                          </div>
                      )
                      : ( <div className="columns col-gapless" style={{ alignItems: "center", margin: "1rem 0", padding: "0 0 0 30px" }}>
                            <div className="column col-6">
                              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                                <li><h4>{props.lastRace.name}</h4></li>
                                <li style={{ marginTop: 0, lineHeight: 1.2 }}><b>{props.lastRace.track}</b></li>
                                <li style={{ marginTop: 0 }}>{moment(props.lastRace.date).format('MMMM Do, YYYY')}</li>
                              </ul>
                            </div>
                            <div className="column col-6">
                              <img src={tracks.find(({ name }) => props.lastRace.track.indexOf(name) >= 0).logo} style={{ display: "block", margin: "0 auto", maxHeight: "150px", height: "100%" }}/>
                            </div>
                          </div>  
                      )
                      
                    }
                    <table>
                      <thead>
                        <tr>
                          <th width="7%">F</th>
                          <th width="7%">S</th>
                          <th>Driver</th>
                          <th width="10%">Interval</th>
                          <th width="10%">Led</th>
                          <th width="10%">Inc</th>
                        </tr>
                      </thead>
                      <tbody>
                        { 
                          props.lastRace.results.map((props, index) => (
                            <tr key={`standings${props.id}`}>
                              <td>{props.finish}</td>
                              <td>{props.start}</td>
                              <td><DriverChip {...props.driver}/></td>
                              <td>{props.interval}</td>
                              <td>{props.led}</td>
                              <td>{props.incidents}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                  <div className="panel-footer">
                    
                  </div>
                </div>
              </div>
                
              <div className="column col-5">
                <div className="panel">
                  <div className="panel-header">
                    <h6 className="panel-title">Current Standings</h6>
                  </div>
                  <div className="panel-body">
                    <table>
                      <thead>
                        <tr>
                          <th width="2%"></th>
                          <th width="2%"></th>
                          <th>Driver</th>
                          <th width="7%">Behind</th>
                        </tr>
                      </thead>
                      <tbody>
                        { props.standings &&
                          props.standings
                            .map((driver, index) => (
                              <tr key={`standings${index}`} style={{opacity: driver.driver.fields.active ? 1 : 0.2}}>
                                <td>
                                  <b>{index + 1}</b>
                                </td>
                                <td>
                                  { parseInt(driver.change, 10) > 0
                                      ? <span style={{color:"green"}}>&#9650;&nbsp;{driver.change.substr(1)}</span>
                                      : parseInt(driver.change, 10) < 0
                                        ? <span style={{color:"red"}}>&#9660;&nbsp;{driver.change.substr(1)}</span>
                                        : ''
                                  }
                                </td>
                                <td>
                                  <a href={`/driver/${driver.driver.sys.id}/`} style={{ whiteSpace: "nowrap" }}>
                                    { driver.driver.fields.numberArt &&
                                      <div style={{ display: "inline-block", marginRight: "6px", width: "22px", height: "22px", position: "relative", top: "6px", marginTop: "-6px" }}>
                                        <img src={ driver.driver.fields.numberArt.fields.file.url } style={{ width: "100%" }} />
                                      </div>
                                    }                      
                                    {(driver.driver.fields.nickname || driver.driver.fields.name).replace(/ /g, '\u00a0')}
                                  </a>
                                </td>
                                <td>{driver.behindLeader}</td>
                              </tr>
                            ))
                        }
                      </tbody>
                    </table>    
                  </div>
                  <div className="panel-footer">
                  
                  </div>  
                </div>        

                { props.nextRace &&
                  <div className="panel" style={{ marginTop: "1rem" }}>
                    <div className="panel-header">
                      <h6 className="panel-title">Next Race</h6>
                    </div>
                    <div className="panel-body text-center">
                      <h4>{props.nextRace.name}</h4>
                      <img src={tracks.find(({ name }) => props.nextRace.track.indexOf(name) >= 0).logo} style={{ display: "block", margin: "0 auto", width: "50%" }}/>
                      <p style={{ margin: 0 }}>{props.nextRace.track}</p>
                      <p style={{ margin: 0 }}>{moment(props.lastRace.date).format('MMMM Do, YYYY')}</p>
                    </div>
                    <div className="panel-footer">
                    
                    </div>  
                  </div>   
                }

              </div>
            </div>
          </div>
        </main>
        
      </div>

    </div>
  )
}

export async function getStaticProps() {
  const leagues = await client.getEntries({ 
    content_type: 'league', 
    'sys.id': leagueId, 
    include: 2 
  });
  const season = leagues.items[0].fields.activeSeason;
  const drivers = await client.getEntries({ content_type: "driver", limit: 500 });
  
  let nextRace = season.fields.schedule
    .filter(race => !race.offWeek && !race.uploaded && moment().isSameOrBefore(race.date, 'week'))
    .sort((a,b) => moment(a.date).diff(b.date))
    .shift();
    
  let lastRace = season.fields.schedule
    .filter(race => !race.offWeek && race.uploaded && moment().isSameOrAfter(race.date, 'week'))
    .sort((a,b) => moment(a.date).diff(b.date))
    .pop();
  if (lastRace) {
    lastRace = { 
      ...lastRace, 
      ...season.fields.results.find(entry => entry.fields.raceId == lastRace.raceId).fields
    };
    lastRace.results = lastRace.results
      .sort((a,b) => a.finish - b.finish)
      .map(result => ({ ...result, driver: drivers.items.find(driver => driver.sys.id === result.id) }))
      .splice(0,5);
  }
    
  const standings = season.fields.standings
    .splice(0,10)
    .map(record => ({ ...record, driver: drivers.items.find(driver => driver.fields.name === record.driver) }))

  return { props: { 
    league: leagues.items[0].fields,
    standings, 
    nextRace, 
    lastRace: lastRace || null,
    drivers: drivers.items
  }};
}