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
  
  return session ? (
	  <div className="container">
  	  <div className="columns">
        <div className="column col-8 col-xl-12 col-mx-auto">
        
          <div className="columns col-gapless" style={{ alignItems: "center", margin: "2rem 0", position: "relative", left: "15px" }}>
            <div className="column col-3 col-sm-12 text-center">
              { props.logo
                  ? <img 
                      src={ props.logo.fields.file.url } 
                      style={{ 
                        display: "block", 
                        maxWidth: "100%",
                        height: "100%", 
                        maxHeight: "150px", 
                        margin: "0 auto"
                      }} 
                    />
                  : <h3 style={{ marginBottom: "2rem" }}>{props.name}</h3>
              }
            </div>
            <div className="column col-6 col-sm-12 text-center">
              <ul className="text-center" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                <li style={{ marginTop: 0, lineHeight: 1.2 }}><b>{trackName}</b></li>
                <li style={{ marginTop: 0 }}>{session.SessionName}</li>
              </ul>
            </div>
            <div className="column col-3 col-sm-12">
              <img 
                src={props.track.logo} 
                style={{ 
                  display: "block", 
                  maxWidth: "100%",
                  height: "100%", 
                  maxHeight: "150px", 
                  margin: "0 auto" 
                }} 
              />
            </div>
          </div>
        
          { drivers.length > 0 && session.ResultsPositions &&
        		<table>
              <thead>
                <tr>
                  <th width="2%">P</th>
                  <th>Driver</th>
                  <th width="10%">Laps</th>
                  <th width="10%">Time</th>
                  <th width="10%">Lap</th>
                </tr>
              </thead>
              <tbody>
          		  { session.ResultsPositions.map((obj, idx) => {                      
                    // Get id, name and number from the iRacing data
                    const driver = drivers[obj.CarIdx];
                    
                    if (!driver) return null;
                    
                    // Match to driver in league data
                    const match = props.drivers.find(({ custId }) => custId == driver.id);
                    
                    return (
                      <tr key={driver.id}>
                        <td>{idx + 1}</td>
                        <td>
                          { match 
                              ? <DriverChip {...match}/>
                              : `#${driver.number} ${driver.name}`
                          }
                        </td>
                        <td>{obj.LapsComplete}</td>
                        <td>{obj.FastestTime.toFixed(3)}</td>
                        <td>{obj.FastestLap}</td>
                      </tr>
                    );
                  })
                }
              </tbody>
        		</table>
          }
          
        </div>
      </div>
    </div>
  ) : null;
}

function DriverChip(props) {
  return props.active ? (
    <a 
      href={`/driver/${props.name.replace(/\s/g, '-').toLowerCase()}/`} 
      style={{ display: "block", whiteSpace: "nowrap" }}
    >
      <NumberArt {...props.numberArt}/>
      {props.nickname || props.name}
    </a>    
  ) : (
    <div className={styles.container}>
      <NumberArt {...props.numberArt}/>
      {props.nickname || props.name}
    </div>    
  );
}

function NumberArt(props) {
  return props.fields ? (
    <div style={{  
      display: "inline-block",
      margin: "-6px 10px 0 0",
      width: "22px",
      height: "22px",
      position: "relative",
      top: "6px"
    }}>
      <img src={ props.fields.file.url } style={{ width: "100%" }} />
    </div>
  ) : null;
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
