function RaceDay(props) {
  const [data, setData] = React.useState({});
  const [socket, setSocket] = React.useState({});
  
  React.useEffect(() => {
    if (!socket.readyState || socket.readyState == WebSocket.CLOSED) {
      const ws = connect(setSocket, setData);
      return () => { 
        // Cleanup open sockets if unmounted
        ws.close();
      };
    }
  }, socket.readyState);

  const { sessions = [], drivers = [], trackName = null } = data;
  const [session] = sessions.slice(-1);
  
  return !session ? null : (
    <div className="container">
    
      <hgroup className="columns">
        <div className="col-10 col-mx-auto">
          <img src="http://images.ctfassets.net/38idy44jf6uy/77oyBku7I2JxxTk6JWl3S7/4b6409e801a89eba830ea54a732e32f7/image.png"/>
          <div>
            <h1>{ props.name }</h1>
            <h2>{ props.trackName }</h2>
          </div>
        </div>
      </hgroup>
      
      <div className="columns">
      
        <div className="column col-5">
          <RaceInfo { ...session } />
          <Leaderboard 
            { ...session } 
            drivers={ drivers.map(
              driver => props.drivers.find(({ custId }) => custId == driver.id) || driver
            )} 
          />
        </div>
        
        <div className="column col-7">
        
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

function connect(setSocket, setData) {
  // let ws = new WebSocket('ws://orldiscordbot-env.eba-zhcidp9s.us-west-2.elasticbeanstalk.com');
  let ws = new WebSocket('ws://localhost');

  ws.onopen = () => {
    console.log('Socket connected');  
    setSocket(ws);
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(data);
      setData(data);
    } catch(error) {
      console.log(error, event.data);
    }
  }

  ws.onclose = (event) => {
    console.log(`Socket closed`, event.reason);
  }
  
  ws.onerror = (err) => {
    console.error(
        "Socket encountered error: ",
        err.message,
        "Closing socket"
    );

    ws.close();
  };   
  
  return ws; 
}

const domContainer = document.querySelector('#raceday');
ReactDOM.render(
  <RaceDay 
    {...JSON.parse(domContainer.dataset.race)} 
    drivers={JSON.parse(domContainer.dataset.drivers)}
  />, 
  domContainer
);

function Flag(props) {
  return (
    <h1 className={`session ${ props.flag || "green" }`}>{ props.SessionName }</h1>
  );
}


function DriverChip(props) {
  return props.active ? (
    <a 
      href={`/driver/${props.name.replace(/\s/g, '-').toLowerCase()}/`} 
      className="driver"
    >
      { props.numberArt && <NumberArt { ...props.numberArt.fields.file }/> }
      { props.nickname || props.name }
    </a>    
  ) : (
    <div className="driver">
      { props.numberArt && <NumberArt { ...props.numberArt.fields.file }/> }
      { props.nickname || props.name }
    </div>    
  );
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
  const ResultsNumLeaders = props.props.ResultsPositions.filter(
    ({ LapsLed }) => LapsLed > 0
  ).length;
  
  return (
    <div>
      <Flag { ...props }/>
      <ul className="columns">
        <li className="column col-6">
          <b>
            { !!props.ResultsOfficial
                ? 'Completed'
                : props.SessionLaps === 'unlimited' 
                  ? `${ props.SessionTimeRemain } remaining`
                  : `Lap ${ props.ResultsLapsComplete } of ${ props.SessionLaps }`
            }
          </b>
        </li>
        { props.SessionType === 'Race' && 
            <li className="column col-6 text-right">
              { props.ResultsNumCautionFlags } cautions for { props.ResultsNumCautionLaps } laps
            </li>
        }
        { props.SessionType === 'Race' && 
            <li className="column col-6 col-ml-auto text-right">
              { props.ResultsNumLeadChanges } lead changes among { ResultsNumLeaders } drivers
            </li>
        }
      </ul>
    </div>
  );
}

function Leaderboard(props) {
  return (
    <table>
      <thead>
        { props.SessionType === 'Race' 
            ? <RaceHeaders { ...props } /> 
            : <TimeHeaders { ...props } />
        }
      </thead>
      <tbody>
        { props.SessionType === 'Race' 
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
  return props.ResultsPositions.map(
    (value, index) => <RaceItem { ...value } Driver={ props.drivers[value.CarIdx] } />
  );
}

function RaceItem(props) {
  const [state, setState] = React.useState(props);
  
  return (
    <tr className={ props.status.toLowerCase() !== 'Running' ? "out" : "" }>
      <td>
        <b>{ props.position }</b>
        { props.position < 10 ? '&nbsp;&nbsp;' : '&nbsp;' }
        { props.position !== props.start &&
            props.position > props.start
              ? <span className="gain"> ▲ { props.start - props.position }</span>
              : <span className="lose"> ▼ { props.position - props.start }</span>
        }
      </td>
      <td>
        <DriverChip { ...props.Driver } />
      </td>
      <td>{ props.bestLap }</td>
      <td>{ props.interval }</td>
      <td>{ props.gap }</td>
      <td>{ props.led }</td>
      <td>{ props.incidents }</td>
      { props.pitting 
         ? <td className="pit"><span>PIT</span></td>
         : <td>L{ props.pitted }</td>
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
  return props.ResultsPositions.map(
    (value, index) => <TimeItem { ...value } Driver={ props.drivers[value.CarIdx] } />
  );
}

function TimeItem(props) {
  const [state, setState] = React.useState(props);
  
  return (
    <tr className={ state.ReasonOutStr !== 'Running' ? "out" : "" }>
      <td><b>{ state.Position }</b></td>
      <td><DriverChip { ...state.Driver } /></td>
      <td>{ state.LapsComplete }</td>
      <td>{ state.FastestTime.toFixed(3) }</td>
      <td>{ state.FastestLap }</td>
      <td>{ state.Incidents }</td>
    </tr>
    
  )
}
