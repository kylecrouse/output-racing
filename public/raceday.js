'use strict';

const e = React.createElement;

class RaceDay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.data = null;
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
    const props = this.props;
    const { Session = null, Car } = this.state;
    return Session ? (
  	  <div className="container">
    	  <div className="columns">
          <div className="column col-8 col-xl-12 col-mx-auto">
          
            <div className="columns" style={{ alignItems: "center" }}>
              <div className="column col-4 col-sm-12 text-center">
                { props.logo
                    ? <img src={ props.logo.fields.file.url } style={{ display: "block", height: "100%", maxHeight: "150px", margin: "0 auto" }} />
                    : <h3 style={{ marginBottom: "2rem" }}>{props.name}</h3>
                }
              </div>
              <div className="column col-4 col-sm-12 text-center">
                <ul className="text-center" style={{ marginBottom: "1rem" }}>
                  <li><b>{props.track.name}</b></li>
                  <li>{Session.Name.Value}</li>
                  <li style={{ marginTop: "0.5rem", fontSize: "0.6rem" }}>
                    Lap {Session.Lap.Value} of {Session.Laps.Value}
                  </li>
                  { Session.Cautions && 
                    <li style={{ fontSize: "0.6rem" }}>
                      {Session.Cautions.Value} cautions for {Session.CautionLaps.Value} laps
                    </li>
                  }
                </ul>
              </div>
              <div className="column col-4 col-sm-12">
                <img src={props.track.logo} style={{ display: "block", height: "100%", maxHeight: "150px", margin: "0 auto", maxWidth: "100%" }} />
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
          		  { Object.entries(Car).map(([key, val], i) => (
                    <tr key={i}>
                      <td>{val.Position.Value}</td>
                      <td>{val.DriverName.Value</td>
                    </tr>
                  ))
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
ReactDOM.render(<RaceDay {...JSON.parse(domContainer.dataset.race)} />, domContainer);