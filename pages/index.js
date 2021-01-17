import Head from 'next/head'
import styles from '../styles/Home.module.css'
import league from '../lib/league/cache';
import moment from 'moment';
import Navbar from '../components/Navbar';
import Video from '../components/Video';
import DriverChip from '../components/DriverChip';
import RichText from '../components/RichText';
import Footer from '../components/Footer';
import { cars, tracks } from '../constants';

export default function Home(props) {
  return (
    <div>
      <Head>
        <title>{props.leagueName}</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://unpkg.com/react@17/umd/react.development.js" crossorigin></script>  
        <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js" crossorigin></script>
        <script src="https://unpkg.com/babel-standalone@6/babel.min.js" crossorigin></script>
        <script src="/raceday.js" type="text/babel"></script>
      </Head>

      <Navbar seasonId={props.seasonId}/>
      
      <div 
        id="raceday" 
        data-race={ JSON.stringify(props.nextRace) } 
        data-drivers={ JSON.stringify(props.drivers) }
        style={{ marginBottom: "4rem" }}
      />

      <div className={styles.tagline}>
        <div className="columns col-gapless hide-sm">
          <figure className="column col-3 col-sm-12">
            <img src="/img/Champ.png" className={styles.thumbnail}/>
          </figure>
          <figure className="column col-3 col-sm-12">
            <img src="/img/dega.png" className={styles.thumbnail}/>
          </figure>
          <figure className="column col-3 col-sm-12">
            <img src="/img/Chambliss.png" className={styles.thumbnail}/>
          </figure>
          <figure className="column col-3 col-sm-12">
            <img src="/img/Autoclub.png" className={styles.thumbnail}/>
          </figure>
        </div>
        <p>An Asphalt Oval League for the Late-Night Racer</p>
      </div>
        
      <div className="container">
  
        <div className="columns">
          <div className="column col-10 col-sm-12 col-mx-auto">
          
            <div className={`columns ${styles.promo}`}>
              <div className={`column col-7 col-sm-12 col-ml-auto`}>
                <h4>Output Racing 2021 season is coming!</h4>
                <div className={styles.multicol}>
                  <p>This year we will be running 3 seasons, each season being 13 races long. There will be an off-week mid-season and 2 off-weeks after each season. Season 1 will start February 9th racing fixed setups with the ARCA car. Cars and schedules for seasons 2 and 3 will be announced later in the year.</p>
                  <p>Race sessions held on Tuesday nights with grid @ 9pm PT. Check the <a href="/schedule/12838">schedule</a> for more information and rule changes.</p>
                  <p>Applications are now open! Minimum C class 2.0 / 1000 iRating required.</p>
                  <p>
                    <a href="/apply" className="btn btn-secondary"><span>Apply</span></a>
                  </p>
                </div>
              </div>
              { props.nextSeason.cars && 
                  <div className={`column col-3 hide-sm col-mr-auto ${styles.carcut}`}>
                    { props.nextSeason.cars.map(name => {
                        const car = cars.find(car => car.name === name);
                        return (
                          <figure key={car.id} className={`text-center`} style={{ overflow: "hidden", margin: "0 0 1rem" }}>
                            <img src={car.image} alt={car.name} style={{ maxHeight: "150px", maxWidth: "102%", marginLeft: "-1%" }}/>
                          </figure>
                        );
                      })
                    }
                  </div>
              }
            </div>
            
          </div>
        </div>
  
        <div className="columns" style={{ marginBottom: "2rem" }}>
          <div className="column col-5 col-md-12 col-ml-auto">

            <div className={styles.description}>
              <h4>{props.season.name}</h4>
              { props.season.description && <RichText {...props.season.description}/> }
            </div>

            { props.season.cars && 
                <div className="columns col-gapless" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
                  { props.season.cars.map(name => {
                      const car = cars.find(car => car.name === name);
                      return (
                        <figure key={car.id} className={`col-${(12/props.season.cars.length).toFixed(0)} col-mx-auto text-center`} style={{ overflow: "hidden" }}>
                          <img src={car.image} alt={car.name} style={{ maxHeight: "150px", maxWidth: "102%", marginLeft: "-1%" }}/>
                          <figcaption style={{ fontSize: "0.6rem" }}>{car.name}</figcaption>
                        </figure>
                      );
                    })
                  }
                </div>
            }

            <h6 className={styles.title}>Latest Results</h6>
                
            <div style={{ marginBottom: "1rem" }}>
              { props.lastRace.broadcast &&
                <Video src={props.lastRace.broadcast}/>
              }
              { props.lastRace.logo
                ? ( <div className={`columns col-gapless ${styles.resultsHeader}`}>
                      <div className="column col-3 col-sm-12 text-center">
                        <img src={ props.lastRace.logo.fields.file.url }/>
                      </div>
                      <div className="column col-6 col-sm-12 text-center" style={{ paddingLeft: "30px" }}>
                        <ul>
                          <li style={{ lineHeight: 1.2 }}><b>{props.lastRace.track.name}</b></li>
                          <li>{moment(props.lastRace.date).format('MMMM Do, YYYY')}</li>
                        </ul>
                      </div>
                      <div className="column col-3 col-sm-12 text-center">
                        <img src={props.lastRace.track.logo}/>
                      </div>
                    </div>
                )
                : ( <div className={`columns col-gapless ${styles.resultsHeader}`}>
                      <div className="column col-6 col-sm-12">
                        <ul>
                          <li><h4>{props.lastRace.name}</h4></li>
                          <li style={{ lineHeight: 1.2 }}><b>{props.lastRace.track.name}</b></li>
                          <li>{moment(props.lastRace.date).format('MMMM Do, YYYY')}</li>
                          <li style={{ fontSize: "0.6rem" }}>{props.lastRace.laps} laps ({props.lastRace.duration})</li>
                          <li style={{ fontSize: "0.6rem" }}>{props.lastRace.cautions} cautions for {props.lastRace.cautionLaps} laps</li>
                          <li style={{ fontSize: "0.6rem" }}>{props.lastRace.leadChanges} lead changes between {props.lastRace.leaders} drivers</li>
                        </ul>
                      </div>
                      <div className="column col-6 col-sm-12">
                        <img src={props.lastRace.track.logo}/>
                      </div>
                    </div>  
                )
              }
            </div>

            <table style={{ marginBottom: "1rem" }}>
              <thead>
                <tr>
                  <th width="7%">F</th>
                  <th className="hide-sm" width="7%">S</th>
                  <th>Driver</th>
                  <th width="10%">Interval</th>
                  <th width="10%">Led</th>
                  <th className="hide-sm" width="10%">Inc</th>
                </tr>
              </thead>
              <tbody>
                { 
                  props.lastRace.results.map((props, index) => (
                    <tr key={`standings${props.id}`}>
                      <td><b>{props.finish}</b></td>
                      <td className="hide-sm">{props.start}</td>
                      <td><DriverChip {...props.driver}/></td>
                      <td>{props.interval}</td>
                      <td>{props.led}</td>
                      <td className="hide-sm">{props.incidents}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>

          </div>
          <div className="column col-3 col-md-12 col-mr-auto">

            { props.leagueDescription &&
                <div className={styles.about}>
                  <h3><span>About Us</span></h3>
                  <div>
                    <RichText {...props.leagueDescription}/>
                    <p>
                      <a href="/apply" className="btn btn-primary"><span>Apply</span></a>
                    </p>
                  </div>
                </div>
            }

            <div className={styles.about}>
              <h3><span>Standings</span></h3>
              <table style={{ marginBottom: "1rem" }}>
                <tbody>
                  { props.standings &&
                    props.standings
                      .map((props, index) => (
                        <tr key={`standings${index}`} style={{opacity: props.driver.active ? 1 : 0.2}}>
                          <td><b>{index + 1}</b></td>
                          <td><DriverChip {...props.driver}/></td>
                          <td>{props.behindLeader}</td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>   
            </div>

            <div className={styles.about}>
              <h3><span>Schedule</span></h3>
              <table>
                <tbody>
                  { props.schedule &&
                    props.schedule
                      .map((props, index) => (
                        <tr key={`schedule${index}`} style={{opacity: props.raceId ? 0.4 : 1}}>
                          <td>{moment(props.date).format('M/D')}</td>
                          <td>
                            { props.raceId 
                                ? <a href={`/race/${props.raceId}/`}>{props.track}</a>
                                : props.track
                            }
                            { !props.counts && <i style={{ opacity: 0.5 }}> (non-points)</i>}
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>

          </div>
        </div>
                    
      </div>
      
      <div style={{ backgroundColor: "black", margin: "3rem 0 -3rem" }}>
        <div className="container">
          <div className="columns">
            <div className="column col-8 col-md-12 col-mx-auto">
              <Video src="https://www.youtube.com/embed/34KPVZWE5Ks"/>
            </div>
          </div>
        </div>
      </div>
      
      <Footer {...props}/>
      
    </div>
  )
}

export async function getStaticProps() {
  // Get data from CMS
  const { name, description, season, seasons, drivers } = await league.load();

  return { props: { 
    leagueName: name,
    leagueDescription: description,
    seasonId: season.id,
    season,
    results: season.results,
    schedule: season.schedule,
    standings: season.standings.slice(0,10), 
    nextRace: season.nextRace, 
    lastRace: season.lastRace,
    nextSeason: seasons.slice(0,1)[0],
    drivers
  }};
}
