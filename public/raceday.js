const initialSessionState = {
  id: -1,
  type: '',
  name: '',
  laps: -1,
  time: -1.0,
  cautions: -1,
  cautionLaps: -1,
  leadChanges: -1,
  leaders: -1,
  lapsCompleted: -1,
  fastestLap: -1.0,
  positions: [],
  official: false
};

const initialDriverState = {
  position: -1,
  start: -1,
  car: -1,
  bestLap: -1,
  bestTime: -1.0,
  led: -1,
  interval: -1.0,
  gap: -1.0,
  incidents: -1,
  status: ''
};

class Broadcast extends React.Component {
  constructor() {
    super();
    this.state = {
      readyState: WebSocket.CLOSED,
      online: false
    };
  }
  
  componentDidMount() {
    this.connect();
  }
  
  componentDidUpdate(prevProps = {}, prevState = {}) {
    if (this.state.readyState === WebSocket.CLOSED 
          && this.prevState.readyState !== this.state.readyState)
      this.connect();
  }
  
  connect() {
    let ws = new WebSocket('wss://bot.outputracing.com/raceday');
  
    ws.onopen = () => {
      console.log('Socket connected');  
      this.setState({ readyState: ws.readyState });
    }
  
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data, reviver);
        // console.log(data);
        if (data.streamers)
          this.setState({ online: data.streamers.get('aussie_sim_commentator').online || false });
      } catch(error) {
        console.log(error, event.data);
      }
    }
  
    ws.onclose = (event) => {
      console.log(`Socket closed`, event.reason);
      this.setState({ readyState: ws.readyState });
    }
    
    ws.onerror = (err) => {
      console.error("Socket encountered error: ", err.message, "Closing socket");
      ws.close();
    };   
  }
  
  render() {
    return this.state.online && moment().isSameOrAfter(this.props.date) && (
      <div className="container">
      
        <hgroup className="columns">
          <div className="col-10 col-mx-auto">
            { this.props.logo &&
              <img src={ this.props.logo.fields.file.url }/>            
            }
            <div>
              <h1>{ this.props.name }</h1>
              <h2>{ this.props.track.name }</h2>
            </div>
          </div>
        </hgroup>
        
        <div className="columns">
          <div className="column col-9 col-lg-12 col-mx-auto">
          
            <div className="twitch">
              <div className="twitch-stream">
                <iframe 
                  src="https://player.twitch.tv/?channel=aussie_sim_commentator&parent=bot.outputracing.com" 
                  frameBorder="0" 
                  allowFullScreen="true" 
                  scrolling="no"
                />
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    );
  }
}

// function Broadcast(props) {
//   const [readyState, setReadyState] = React.useState(WebSocket.CLOSED);
//   const [online, setOnline] = React.useState(false);
//     
//   React.useEffect(() => {
//     if (readyState === WebSocket.CLOSED) {
//       let ws = new WebSocket('wss://bot.outputracing.com/raceday');
//     
//       ws.onopen = () => {
//         console.log('Socket connected');  
//         setReadyState(ws.readyState);
//       }
//     
//       ws.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data, reviver);
//           console.log(data);
//           if (data.streamers)
//             setOnline(data.streamers.get('aussie_sim_commentator').online || false);
//         } catch(error) {
//           console.log(error, event.data);
//         }
//       }
//     
//       ws.onclose = (event) => {
//         console.log(`Socket closed`, event.reason);
//         setReadyState(ws.readyState);
//       }
//       
//       ws.onerror = (err) => {
//         console.error("Socket encountered error: ", err.message, "Closing socket");
//         ws.close();
//       };   
// 
//     }
//   }, [readyState]);
//   
//   return online && moment().isSameOrAfter(props.date) && (
//     <div className="container">
//     
//       <hgroup className="columns">
//         <div className="col-10 col-mx-auto">
//           { props.logo &&
//             <img src={ props.logo.fields.file.url }/>            
//           }
//           <div>
//             <h1>{ props.name }</h1>
//             <h2>{ props.track.name }</h2>
//           </div>
//         </div>
//       </hgroup>
//       
//       <div className="columns">
//         <div className="column col-9 col-lg-12 col-mx-auto">
//         
//           <div className="twitch">
//             <div className="twitch-stream">
//               <iframe 
//                 src="https://player.twitch.tv/?channel=aussie_sim_commentator&parent=bot.outputracing.com" 
//                 frameBorder="0" 
//                 allowFullScreen="true" 
//                 scrolling="no"
//               />
//             </div>
//           </div>
//           
//         </div>
//       </div>
//       
//     </div>
//   );
// }

function RaceDay(props) {
  const [raceday, setRaceday] = React.useState(true);
  const [track, setTrack] = React.useState(props.track.name);
  const [session, setSession] = React.useState(initialSessionState);
  const [drivers, setDrivers] = React.useState([initialDriverState]);
  const [readyState, setReadyState] = React.useState(WebSocket.CLOSED);
  
  React.useEffect(() => {
    if (readyState === WebSocket.CLOSED) {
      let ws = new WebSocket('wss://bot.outputracing.com/raceday');
      // let ws = new WebSocket('ws://localhost');
    
      ws.onopen = () => {
        console.log('Socket connected');  
        setReadyState(ws.readyState);
      }
    
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data, reviver);
          console.log(data);

          if (data.trackName) 
            setTrack(data.trackName);
            
          if (data.drivers) 
            setDrivers(data.drivers);
            
          if (data.sessions) {
            data.sessions = data.sessions.map((s, i) => {
              const leaders = s.ResultsPositions.reduce(
                (count, { LapsLed }) => count += LapsLed > 0 ? 1 : 0, 
                0
              );
              return {
                id: s.SessionNum,
                type: s.SessionType,
                name: s.SessionName,
                laps: s.SessionLaps,
                time: s.SessionTime,
                positions: s.ResultsPositions.map((p, i) => {
                  const o = {
                    ...drivers[p.CarIdx],
                    car: p.CarIdx,
                    position: p.Position,
                    start: data.QualifyResultsInfo && data.QualifyResultsInfo.Results
                      ? data.QualifyResultsInfo.Results.findIndex(({ CarIdx }) => CarIdx === p.carIdx) + 1
                      : -1,
                    bestLap: p.FastestLap,
                    bestTime: p.FastestTime,
                    led: p.LapsLed,
                    interval: 0,
                    gap: 0,
                    incidents: p.Incidents,
                    status: p.ReasonOutStr
                  };
                  return o;
                }),
                cautions: s.ResultsNumCautionFlags,
                cautionLaps: s.ResultsNumCautionLaps,
                leadChanges: Math.max(leaders, s.ResultsNumLeadChanges),
                leaders: leaders,
                lapsCompleted: s.ResultsLapsComplete,
                fastestLap: s.ResultsFastestLap.map(({ CarIdx }) => CarIdx),
                official: !!s.ResultsOfficial
              };
            });
            
            setSession(data.sessions[data.sessions.length - 1]);
          }
          
          if (data.pitting && session.type === 'Race') {
            setSession({ 
              ...session,
              positions: session.positions.map(p => ({
                ...p,
                pitting: data.pitting[p.car],
                pitted: data.pitting[p.car] ? session.lapsCompleted + 1 : data.pitted
              }))
            });
          }
          
        } catch(error) {
          console.log(error, event.data);
        }
      }
    
      ws.onclose = (event) => {
        console.log(`Socket closed`, event.reason);
        setReadyState(ws.readyState);
      }
      
      ws.onerror = (err) => {
        console.error(
            "Socket encountered error: ",
            err.message,
            "Closing socket"
        );
    
        ws.close();
      };   

    }
  }, [readyState]);

  return raceday && (
    <div className="container">
    
      <hgroup className="columns">
        <div className="col-10 col-mx-auto">
          <img src="http://images.ctfassets.net/38idy44jf6uy/77oyBku7I2JxxTk6JWl3S7/4b6409e801a89eba830ea54a732e32f7/image.png"/>
          <div>
            <h1>{ props.name }</h1>
            <h2>{ track }</h2>
          </div>
        </div>
      </hgroup>
      
      <div className="columns">
        
        { session.id > -1 
            ? <div className="column col-5 col-mx-auto">
                <RaceInfo { ...session } />
                <Leaderboard 
                  { ...session } 
                  drivers={ drivers.map(
                    driver => props.drivers.find(({ custId }) => custId == driver.id) || driver
                  )} 
                />
              </div>
            : <div className="column col-5 col-mx-auto teaser">
                <h3>Coverage begins at 8:00pm PT</h3>
              </div> 
        }
        
        <div className="column col-7 col-mx-auto">
        
          <div className="twitch">
            <div className="twitch-stream">
              <iframe 
                src="https://player.twitch.tv/?video=871720855&parent=localhost" 
                frameBorder="0" 
                allowFullScreen="true" 
                scrolling="no"
              />
            </div>
          </div>
          
          { props.streamers && 
              <div className="grid columns">
                { props.streamers.map(
                    (props, index) => <Stream key={`stream${index}`} { ...props } />
                  ) 
                }
              </div> 
          }
            
        </div>
        
      </div>
      
    </div>
  );
  
}

const domContainer = document.querySelector('#raceday');
ReactDOM.render(
  <Broadcast 
    {...JSON.parse(domContainer.dataset.race)} 
    drivers={JSON.parse(domContainer.dataset.drivers)}
  />, 
  domContainer
);

function Flag(props) {
  return (
    <h1 className={`session ${ props.flag || "green" }`}>{ props.name }</h1>
  );
}


function DriverChip(props) {
  return props.active 
    ? <a 
        href={`/driver/${props.name.replace(/\s/g, '-').toLowerCase()}/`} 
        className="driver"
      >
        { props.numberArt && <NumberArt { ...props.numberArt.fields.file }/> }
        { props.nickname || props.name }
      </a>    
    : <div className="driver">
        { props.numberArt && <NumberArt { ...props.numberArt.fields.file }/> }
        { props.nickname || props.name }
      </div>
}

function NumberArt(props) {
  return (
    <div style={{  
      display: "inline-block",
      margin: "-6px 10px 0 0",
      width: "22px",
      height: "22px",
      position: "relative",
      top: "6px"
    }}>
      <img src={ props.url } style={{ width: "100%" }} />
    </div>
  );
}

function Stream(props) {
  return (
    <div className="twitch column col-4">
      <div className="twitch-header">
        <div>
          <DriverChip { ...props.Driver } />
        </div>
      </div>
      <div className="twitch-stream">
        <iframe 
          src="https://player.twitch.tv/?video=871735574&parent=localhost" 
          frameBorder="0" 
          allowFullScreen="true" 
          scrolling="no"
        />
      </div>
    </div>
  );
}

function RaceInfo(props) {
  return (
    <div>
      <Flag { ...props }/>
      <ul className="columns">
        <li className="column col-6">
          <b>
            { props.official
                ? 'Completed'
                : props.laps === 'unlimited' 
                  ? `${ props.timeRemaining } remaining`
                  : `Lap ${ props.lapsCompleted } of ${ props.laps }`
            }
          </b>
        </li>
        { props.type === 'Race' && 
            <li className="column col-6 text-right">
              { props.cautions } cautions for { props.cautionLaps } laps
            </li>
        }
        { props.type === 'Race' && 
            <li className="column col-6 col-ml-auto text-right">
              { props.leadChanges } lead changes among { props.leaders } drivers
            </li>
        }
      </ul>
    </div>
  );
}

function Leaderboard(props) {
  console.log(props);
  return (
    <table>
      <thead>
        { props.type === 'Race' 
            ? <RaceHeaders { ...props } /> 
            : <TimeHeaders { ...props } />
        }
      </thead>
      <tbody>
        { props.type === 'Race' 
            ? <RaceItems { ...props } /> 
            : <TimeItems { ...props } />
        }
      </tbody>
    </table>

  );
}

function RaceHeaders(props) {
  return (
    <tr>
      <th width="5%"></th>
      <th></th>
      <th width="10%">Best Lap</th>
      <th width="10%">Interval</th>
      <th width="8%">Gap</th>
      <th width="8%">Led</th>
      <th width="8%">Inc</th>
      <th width="8%">Pit</th>
    </tr>
  );
}

function RaceItems(props) {
  return props.positions.map(
    (value, index) => (
      <RaceItem 
        key={`RaceItem${index}`} 
        { ...value } 
        Driver={ props.drivers[value.car] } 
      />
    )
  );
}

function RaceItem(props) {
  return (
    <tr className={ props.status !== 'Running' ? "out" : "" }>
      <td>
        <b>{ props.position }</b>
        { props.position < 10 && '\u00a0' }
        { props.start > 0 && (
            props.position !== props.start && props.position > props.start
              ? <span className="gain"> ▲ { props.start - props.position }</span>
              : <span className="lose"> ▼ { props.position - props.start }</span>
          )
        }
      </td>
      <td>
        <DriverChip { ...props.Driver } />
      </td>
      <td className="text-right">{ props.bestTime.toFixed(3) }</td>
      <td className="text-right">{ props.interval.toFixed(1) }</td>
      <td className="text-right">{ props.gap.toFixed(1) }</td>
      <td className="text-right">{ props.led }</td>
      <td className="text-right">{ props.incidents }</td>
      { props.pitting 
         ? <td className="pit"><span>PIT</span></td>
         : <td className="text-right">L{ props.pitted }</td>
      }
    </tr>
    
  )
}

function TimeHeaders(props) {
  return (
    <tr>
      <th width="5%"></th>
      <th></th>
      <th width="10%">Laps</th>
      <th width="10%">Best Time</th>
      <th width="8%">Best Lap</th>
      <th width="8%">Inc</th>
    </tr>
  );
}

function TimeItems(props) {
  return props.positions.map(
    (value, index) => (
      <TimeItem 
        key={`TimeItem${index}`} 
        { ...value } 
        Driver={ props.drivers[value.car] } 
      />
    )
  );
}

function TimeItem(props) {
  return (
    <tr className={ props.status !== 'Running' ? "out" : "" }>
      <td><b>{ props.position }</b></td>
      <td><DriverChip { ...props.Driver } /></td>
      <td>{ props.laps }</td>
      <td>{ props.bestTime.toFixed(3) }</td>
      <td>{ props.bestLap }</td>
      <td>{ props.incidents }</td>
    </tr>
    
  )
}

function reviver(key, value) {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}