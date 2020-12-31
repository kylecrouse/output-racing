import Head from 'next/head'
import styles from '../styles/Home.module.css'
import league from '../lib/league/cache';
import moment from 'moment';
import Navbar from '../components/Navbar';
import Video from '../components/Video';
import DriverChip from '../components/DriverChip';
import { cars, tracks } from '../constants';

export default function Home(props) {
  return (
    <div>
      <Head>
        <title>{props.leagueName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar seasonId={props.seasonId}/>
      
      <img src="/2020-11-04_15-13-02_0.png" style={{ display: "block", width: "100%", marginTop: "-2rem" }}/>
      
      <div className="tagline">An Asphalt Oval League for the Late Night Racer</div>
        
      <div className="container">
      
        <div className="columns">
          <div className="column col-8 col-xl-12 col-mx-auto">
          
            <div className="columns" style={{ marginBottom: "2rem" }}>
              <div className="column col-6">
                <h2>About Us</h2>
                <p>Output Racing is an online sim racing league on iRacing.</p>
                <p>We put this league together to provide a place for the late night racer to hang out, make friends and race hard. Established in mid 2018 with the goal of building a competitive league without toxic people or egos, we focused on building a tight knit community that meshes well on and off the track.</p>
                <p>If you are a late night racer that is looking for a fun group to chill and race with once a week, feel free to apply. We welcome a wide range of skill levels with a minimum C class 2.0 SR license and 1000 IR.</p>
                <p><a className="btn btn-primary" href="/apply">Apply</a></p>
              </div>
              <div className="column col-5 col-ml-auto">
                <img src="/Autclub-ocvcbeysezsqrsibr3cet23yfi51isxfp6kw671qpc.png" style={{ display: "block", height: "100%", maxWidth: "100%", margin: "0 auto"}}/>
              </div>
            </div>
            
          </div>
        </div>
      
      </div>
      
      <div style={{ backgroundColor: "black", marginBottom: "2rem", padding: ".8rem 0" }}>
        <div className="container">
          <div className="columns">
            <div className="column col-8 col-xl-12 col-mx-auto">
              <div className="columns">
                <img src="/Charlotte-Start.png" className="column col-3"/>
                <img src="/Champ.png" className="column col-3"/>
                <img src="/Chambliss.png" className="column col-3"/>
                <img src="/Autoclub.png" className="column col-3"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container">
      
        <div className="columns">
          <div className="column col-8 col-xl-12 col-mx-auto">
          
            <h6>Current Season</h6>
                
            <div className="columns">
              <div className="column col-7 col-sm-12">
              
                <div className="description">
                  <h5>{props.season.name}</h5>
                  { props.season.description && 
                    props.season.description.content.map(el => renderNode(el))
                  }
                </div>

                { props.season.cars && 
                    <div className="columns col-gapless" style={{ margin: "1rem 0 3rem" }}>
                      { props.season.cars.map(name => {
                          const car = cars.find(car => car.name === name);
                          return (
                            <figure key={car.id} className={`col-${(12/props.season.cars.length).toFixed(0)} col-mx-auto text-center`}>
                              <img src={car.image} alt={car.name} style={{ maxHeight: "150px", maxWidth: "100%" }}/>
                              <figcaption style={{ fontSize: "0.6rem" }}>{car.name}</figcaption>
                            </figure>
                          );
                        })
                      }
                    </div>
                }
                
              </div>
              <div className="column col-5 col-sm-12">
                { props.nextRace &&
                  <div className="panel" style={{ marginTop: "1rem" }}>
                    <div className="panel-header"><h6 className="panel-title">Next Race</h6></div>
                    <div className="panel-body text-center" style={{ margin: "1rem 0 2rem" }}>
                      <h4>{props.nextRace.name}</h4>
                      <img src={tracks.find(({ name }) => props.nextRace.track.indexOf(name) >= 0).logo} style={{ display: "block", margin: "0 auto", width: "50%" }}/>
                      <p style={{ margin: 0 }}>{props.nextRace.track}</p>
                      <p style={{ margin: 0 }}>{moment(props.lastRace.date).format('MMMM Do, YYYY')}</p>
                    </div>
                  </div>   
                }
              </div>
            </div>
  
            <div className="columns">
              <div className="column col-7 col-md-12">
              
                { props.lastRace &&
                  <div style={{ marginBottom: "1rem" }}>
                    <h6>Last Race</h6>
                    { props.lastRace.broadcast &&
                      <Video src={props.lastRace.broadcast}/>
                    }
                    { props.lastRace.logo
                      ? ( <div className="columns col-gapless" style={{ alignItems: "center", margin: "2rem 0", position: "relative", left: "15px" }}>
                            <div className="column col-3 text-center">
                              <img src={ props.lastRace.logo.fields.file.url } style={{ display: "block", margin: "0 auto", maxHeight: "80px", height: "100%" }} />
                            </div>
                            <div className="column col-6 text-center" style={{ paddingLeft: "30px" }}>
                              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                                <li style={{ marginTop: 0, lineHeight: 1.2 }}><b>{props.lastRace.track.name}</b></li>
                                <li style={{ marginTop: 0 }}>{moment(props.lastRace.date).format('MMMM Do, YYYY')}</li>
                              </ul>
                            </div>
                            <div className="column col-3 text-center">
                              <img src={props.lastRace.track.logo} style={{ display: "block", margin: "0 auto", maxHeight: "80px", height: "100%", maxWidth: "100%" }}/>
                            </div>
                          </div>
                      )
                      : ( <div className="columns col-gapless" style={{ alignItems: "center", margin: "2rem 0", padding: "0 0 0 30px" }}>
                            <div className="column col-6">
                              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                                <li><h4>{props.lastRace.name}</h4></li>
                                <li style={{ marginTop: 0, lineHeight: 1.2 }}><b>{props.lastRace.track.name}</b></li>
                                <li style={{ marginTop: 0 }}>{moment(props.lastRace.date).format('MMMM Do, YYYY')}</li>
                              </ul>
                            </div>
                            <div className="column col-6">
                              <img src={props.lastRace.track.logo} style={{ display: "block", margin: "0 auto", maxHeight: "150px", height: "100%", maxWidth: "100%" }}/>
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
                          props.lastRace.results.slice(0,5).map((props, index) => (
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
                    <p className="text-center" style={{ marginTop: "1rem" }}><a href={`/race/${props.lastRace.raceId}`} className="btn btn-primary">View Results</a></p> 
                  </div>
                }
              </div>
                
              <div className="column col-5 col-md-12">

                <div>
                  <h6>Standings</h6>
                  <p className="text-center" style={{ fontSize: "0.8rem" }}>After {props.results.filter(({ counts }) => counts).length} of {props.schedule.filter(({ counts }) => counts).length} Races</p>
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
                          .map((props, index) => (
                            <tr key={`standings${index}`} style={{opacity: props.driver.active ? 1 : 0.2}}>
                              <td>
                                <b>{index + 1}</b>
                              </td>
                              <td>
                                { parseInt(props.change, 10) > 0
                                    ? <span style={{color:"green"}}>&#9650;&nbsp;{props.change.substr(1)}</span>
                                    : parseInt(props.change, 10) < 0
                                      ? <span style={{color:"red"}}>&#9660;&nbsp;{props.change.substr(1)}</span>
                                      : ''
                                }
                              </td>
                              <td>
                                <a href={`/driver/${props.driver.id}/`} style={{ whiteSpace: "nowrap" }}>
                                  { props.driver.numberArt &&
                                    <div style={{ display: "inline-block", marginRight: "6px", width: "22px", height: "22px", position: "relative", top: "6px", marginTop: "-6px" }}>
                                      <img src={ props.driver.numberArt.fields.file.url } style={{ width: "100%" }} />
                                    </div>
                                  }                      
                                  {(props.driver.nickname || props.driver.name).replace(/ /g, '\u00a0')}
                                </a>
                              </td>
                              <td>{props.behindLeader}</td>
                            </tr>
                          ))
                      }
                    </tbody>
                  </table>   
                  <p className="text-center" style={{ marginTop: "1rem" }}><a href={`/standings/${props.seasonId}`} className="btn btn-primary">View Standings</a></p> 
                </div>        

              </div>
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
      
      <footer style={{ backgroundColor: "black", marginTop: "3rem", padding: "2rem 0 3rem" }}>
        <Navbar seasonId={props.seasonId} logo="false"/>
        <p className="text-center" style={{ color: "white", margin: "2rem 0 0" }}>&copy; 2020 Output Racing League</p>
      </footer>

    </div>
  )
}

export async function getStaticProps() {
  // Get data from CMS
  const { name, season } = await league.load();

  return { props: { 
    leagueName: name,
    seasonId: season.id,
    season,
    results: season.results,
    schedule: season.schedule,
    standings: season.standings.slice(0,10), 
    nextRace: season.nextRace, 
    lastRace: season.lastRace
  }};
}

function renderNode({ data, nodeType, content, marks, value }) {
  switch(nodeType) {
    case 'heading-3':
      return <h3>{content.map(el => renderNode(el))}</h3>;
    case 'paragraph':
      return <p>{content.map(el => renderNode(el))}</p>;
    case 'unordered-list':
      return <ul>{content.map(el => renderNode(el))}</ul>;
    case 'ordered-list':
      return <ol>{content.map(el => renderNode(el))}</ol>;
    case 'list-item':
      return <li>{content.map(el => renderNode(el))}</li>;
    case 'hyperlink':
      return <a href={data.uri}>{content.map(el => renderNode(el))}</a>
    case 'text':
      return marks.length > 0 
        ? marks.reduce((html, el) => renderMark(el, html), value)
        : value;
  }
}

function renderMark(mark, content) {
  switch(mark.type) {
    case 'bold':
      return <b>{content}</b>;
    case 'italic':
      return <i>{content}</i>;
    default:
      return content;
  }
}