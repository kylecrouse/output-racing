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
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js" crossorigin></script>
        <script src="/raceday.js" type="text/babel"></script>
      </Head>

      <Navbar />
      
      <div 
        id="raceday" 
        data-race={ JSON.stringify(props.nextRace) } 
        data-drivers={ JSON.stringify(props.drivers) }
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
      
        { props.lastRace &&
          <div className="columns">
            <div className="column col-8 col-mx-auto banner checkered">
              <a href={`/results/${props.lastRace.raceId}`} className="header">
                { props.lastRace.logo &&
                  <img src={ props.lastRace.logo.fields.file.url }/>
                }
                <ul>
                  <li><b>{props.lastRace.track.name}</b></li>
                  <li>{moment(props.lastRace.date).format('MMMM Do, YYYY')}</li>
                </ul>
              </a>
              <div className="columns col-gapless">
                <img src={ props.lastRace.media[0].fields.file.url } className="column col-10"/>
                <div className="column col-2 sidebar">
                  { props.lastRace.results.slice(0,5).map(props => (
                      <div className="top5">
                        <span className="position"><span>{props.finish}</span></span>
                        <DriverChip {...props.driver}/>
                      </div>
                    ))
                  }
                  <p><a href="/apply" className="btn btn-primary"><span>Full Results</span></a></p>
                </div>
              </div>
            </div>
          </div>
        }      
  
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

            { props.lastRace && props.lastRace.broadcast &&
                <div className={styles.description}>
                  <h4>Race Rewind</h4>
                  <Video src={props.lastRace.broadcast}/>
                </div>
            }
            
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

            { Array.isArray(props.standings) && props.standings.length > 0 &&
              <div className={styles.about}>
                <h3><span>Standings</span></h3>
                <table style={{ marginBottom: "1rem" }}>
                  <tbody>
                    { props.standings
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
            }

            <div className={styles.about}>
              <h3><span>Schedule</span></h3>
              <table>
                <tbody>
                  { props.schedule &&
                    props.schedule
                      .map((props, index) => (
                        <tr key={`schedule${index}`} style={{opacity: props.raceId ? 0.4 : 1}}>
                          <td>{moment(props.date).format('M/D')}</td>
                          { props.offWeek
                              ? <td><i>Off Week</i></td>
                              : <td>
                                  { props.raceId 
                                      ? <a href={`/results/${props.raceId}/`}>{props.track}</a>
                                      : props.track
                                  }
                                  { !props.counts && <i style={{ opacity: 0.5 }}> (non-points)</i>}
                                </td>
                          }
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
