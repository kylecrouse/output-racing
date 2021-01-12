'use strict';

const e = React.createElement;

class RaceDay extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sessions: [], ws: null };
  }
  
  componentDidMount() {
    this.connect();
  }
  
  timeout = 250;
  
  connect = () => {
    let ws = new WebSocket('ws://orldiscordbot-env.eba-zhcidp9s.us-west-2.elasticbeanstalk.com');
    let that = this;
    let connectInterval;

    ws.onopen = () => {
      console.log('Socket connected');

      this.setState({ ws });

      that.timeout = 250; // reset timer to 250 on open of websocket connection 
      clearTimeout(connectInterval); // clear Interval on on open of websocket connection
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data);
        this.setState(data);
      } catch(error) {
        console.log(error, event.data);
      }
    }

    ws.onclose = (event) => {
      console.log(
          `Socket is closed. Reconnect will be attempted in ${Math.min(
              10000 / 1000,
              (that.timeout + that.timeout) / 1000
          )} seconds.`,
          event.reason
      );

      // increment retry interval
      that.timeout = that.timeout + that.timeout;
      // call check function after timeout
      connectInterval = setTimeout(this.check, Math.min(10000, that.timeout));
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
  
  check = () => {
    const { ws } = this.state;
    //check if websocket instance is closed, if so call `connect` function.
    if (!ws || ws.readyState == WebSocket.CLOSED) this.connect(); 
  };


  render() {
    // const session = this.state.sessions.find(
    //   ({ SessionNum }) => SessionNum == this.state.sessionNum
    // );
    const [session] = this.state.sessions.slice(-1);
    
    return session ? (
  	  <div className="container">
    	  <div className="columns">
          <div className="column col-8 col-xl-12 col-mx-auto">
          
            <div className="columns" style={{ alignItems: "center" }}>
              <div className="column col-4 col-sm-12 text-center">
                { this.props.logo
                    ? <img 
                        src={ this.props.logo.fields.file.url } 
                        style={{ 
                          display: "block", 
                          maxWidth: "100%",
                          height: "100%", 
                          maxHeight: "150px", 
                          margin: "0 auto"
                        }} 
                      />
                    : <h3 style={{ marginBottom: "2rem" }}>{this.props.name}</h3>
                }
              </div>
              <div className="column col-4 col-sm-12 text-center">
                <ul className="text-center" style={{ marginBottom: "1rem" }}>
                  <li><b>{this.state.trackName}</b></li>
                  <li>{session.SessionName}</li>
                </ul>
              </div>
              <div className="column col-4 col-sm-12">
                <img 
                  src={this.props.track.logo} 
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
          
            { session.ResultsFastestLap &&
          		<table>
                <thead>
                  <tr>
                    <th width="2%">P</th>
                    <th>Driver</th>
                    <th>Time</th>
                    <th>Lap</th>
                  </tr>
                </thead>
                <tbody>
            		  { this.state.drivers && session.ResultsFastestLap
                      .map((obj, index) => {
                        // Get id, name and number from the iRacing data
                        const { id, name, number } = this.state.drivers.find(
                          ({ id }) => id == obj.CarIdx
                        );
                        // Match to driver in league data
                        const driver = this.props.drivers.find(
                          ({ custId }) => custId == id
                        );
                        return (
                          <tr key={id}>
                            <td>{index}</td>
                            <td>
                              { driver 
                                  ? `#${driver.number} ${driver.nickname || driver.name}`
                                  : `#${number} ${name}`
                              }
                            </td>
                            <td>obj.FastestTime</td>
                            <td>obj.FastestLap</td>
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
}

const domContainer = document.querySelector('#raceday');
ReactDOM.render(
  <RaceDay 
    {...JSON.parse(domContainer.dataset.race)} 
    drivers={JSON.parse(domContainer.dataset.drivers)}
  />, 
  domContainer
);