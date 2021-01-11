'use strict';

const e = React.createElement;

class RaceDay extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sessions: [] };
    this.ws = new WebSocket('ws://orldiscordbot-env.eba-zhcidp9s.us-west-2.elasticbeanstalk.com');
  }
  
  componentDidMount() {
    this.ws.onopen = () => {
      console.log('connected');
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data);
        this.setState(data);
      } catch(error) {
        console.log(error, event.data);
      }
    }

    this.ws.onclose = () => {
      console.log('disconnected');
    }
  }

  render() {
    const session = this.state.sessions.find(
      ({ SessionNum }) => SessionNum == this.state.sessionNum
    );
    
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
          
        		<table>
              <thead>
                <tr>
                  <th width="2%">P</th>
                  <th>Driver</th>
                </tr>
              </thead>
              <tbody>
          		  { this.state.positions
                    .filter((carIdx) => this.state.drivers[carIdx] > 0)
                    .map((carIdx, index) => {
                      const driver = this.props.drivers.find(
                        ({ custId }) => custId == this.state.drivers[carIdx]
                      );
                      return (
                        <tr key={carIdx}>
                          <td>{index}</td>
                          <td>{driver.nickname || driver.name}</td>
                        </tr>
                      );
                    })
                }
              </tbody>
        		</table>

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