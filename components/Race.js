import moment from 'moment'
import Video from './Video'
import DriverChip from './DriverChip'

export default function Race(props) {
  return (
  	<div>
      
      <style jsx>{`
        ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        li { 
          margin: 0; 
        }
        
        table {
          margin-top: 3rem;
        }

        @media only screen and (max-width: 760px), (min-device-width: 768px) and (max-device-width: 1024px) {
        
        	/* Force table to not be like tables anymore */
        	table, thead, tbody, th, td, tr { 
        		display: block; 
        	}
          
          table {
            margin-top: 1rem;
          }
          
        	/* Hide table headers (but not display: none;, for accessibility) */
        	thead tr { 
        		position: absolute;
        		top: -9999px;
        		left: -9999px;
        	}
          
          tbody tr {
            margin-bottom: 1rem;
          }
          
        	td { 
        		/* Behave  like a "row" */
        		border: none;
        		border-bottom: 1px solid #eee; 
        		position: relative;
        		padding-left: 50%; 
            text-align: right;
        	}
          
          tbody tr:nth-child(odd) td {
            border-bottom-color: white;
          }
          
          td:last-child {
            border-bottom: 0;
        	}
          
        	td:before { 
        		/* Now like a table header */
        		position: absolute;
        		/* Top/left values mimic padding */
        		top: 6px;
        		left: 6px;
        		width: 45%; 
        		padding-right: 10px; 
        		white-space: nowrap;
            text-align: left;
            font-weight: bold;
        	}
        	
        	/*
        	Label the data
        	*/
        	td:nth-of-type(1):before { content: "Finish"; }
        	td:nth-of-type(2):before { content: "Start"; }
        	td:nth-of-type(3):before { content: "Driver"; }
        	td:nth-of-type(4):before { content: "Points"; }
        	td:nth-of-type(5):before { content: "Interval"; }
        	td:nth-of-type(6):before { content: "Laps"; }
        	td:nth-of-type(7):before { content: "Laps Led"; }
        	td:nth-of-type(8):before { content: "Fastest Lap"; }
        	td:nth-of-type(9):before { content: "Average Lap"; }
        	td:nth-of-type(10):before { content: "Incidents"; }
        	td:nth-of-type(11):before { content: "Status"; }
        }
      `}</style>
          
      <div className="columns" style={{ alignItems: "center" }}>
        <div className="column col-4 col-sm-12 text-center">
          { props.logo
              ? <img src={ props.logo.fields.file.url } style={{ display: "block", height: "100%", maxHeight: "150px", margin: "0 auto", maxWidth: "100%" }} />
              : <h3 style={{ marginBottom: "2rem" }}>{props.name}</h3>
          }
        </div>
        <div className="column col-4 col-sm-12 text-center">
          <ul className="text-center" style={{ marginBottom: "1rem" }}>
            <li><b>{props.track.name}</b></li>
            <li>{moment.parseZone(props.date).format('MMMM Do, YYYY')}</li>
            <li style={{ marginTop: "0.5rem", fontSize: "0.6rem" }}>{props.laps} laps ({props.duration})</li>
            <li style={{ fontSize: "0.6rem" }}>{props.cautions} cautions for {props.cautionLaps} laps</li>
            <li style={{ fontSize: "0.6rem" }}>{props.leadChanges} lead changes between {props.leaders} drivers</li>
          </ul>
        </div>
        <div className="column col-4 col-sm-12">
          <img src={props.track.logo} style={{ display: "block", height: "100%", maxHeight: "150px", margin: "0 auto", maxWidth: "100%" }} />
        </div>
      </div>

  		<table>
        <thead>
          <tr>
            <th width="2%">F</th>
            <th width="2%">S</th>
            <th>Driver</th>
            <th width="7%">Points</th>
            <th width="7%">Interval</th>
            <th width="7%">Laps</th>
            <th width="7%">Led</th>
            <th width="7%">Fastest</th>
            <th width="7%">Average</th>
            <th width="7%">Incidents</th>
            <th width="7%">Status</th>
          </tr>
        </thead>
        <tbody>
  		  { 
  			props.results
  			  .sort((a, b) => parseInt(a.finish, 10) > parseInt(b.finish, 10))
  			  .map(props => ( props.driver &&
            <tr key={props.id} style={{ opacity: props.driver.active ? 1 : 0.3 }}>
              <td>{props.finish}</td>
              <td>{props.start}</td>
              <td><DriverChip {...props.driver}/></td>
              <td>{parseInt(props.points, 10) + parseInt(props.bonus, 10) + parseInt(props.penalty, 10)}</td>
              <td>{props.interval}</td>
              <td>{props.completed}</td>
              <td>{props.led}</td>
              <td>{props.fastest}</td>
              <td>{props.average}</td>
              <td>{props.incidents}</td>
              <td>{props.status}</td>
            </tr>
          )) 
  		  }
        </tbody>
  		</table>

      { props.broadcast && <Video src={props.broadcast} style={{ marginTop: "3rem" }}/> }

      <div style={{ marginTop: "2rem" }}>
        { props.media && props.media.map(image => renderImage(image)) }
      </div>
            
  	</div>
  )
}

function renderImage(image) {
  if (image && image.fields.file) {
    return <img src={ image.fields.file.url } style={{ width: "100%", marginBottom: "2rem" }} />
  } else {
    return null
  }
}
