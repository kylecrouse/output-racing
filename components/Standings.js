import moment from 'moment';
import DriverChip from './DriverChip'

export default function Standings(props) {
  return (
  	<div>
	    
      <style jsx>{`
        .standings th {
          width: 8.33%;
        }

        @media only screen and (max-width: 760px), (min-device-width: 768px) and (max-device-width: 1024px) {
        
        	/* Force table to not be like tables anymore */
        	table, thead, tbody, th, td, tr { 
        		display: block; 
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
        	.standings td:nth-of-type(1):before { content: "Position"; }
        	.standings td:nth-of-type(2):before { content: "Change"; }
        	.standings td:nth-of-type(3):before { content: "Driver"; }
        	.standings td:nth-of-type(4):before { content: "Starts"; }
        	.standings td:nth-of-type(5):before { content: "Points"; }
        	.standings td:nth-of-type(6):before { content: "Behind Next"; }
        	.standings td:nth-of-type(7):before { content: "Behind Leader"; }
        	.standings td:nth-of-type(8):before { content: "Wins"; }
        	.standings td:nth-of-type(9):before { content: "Top 5s"; }
        	.standings td:nth-of-type(10):before { content: "Top 10s"; }
        	.standings td:nth-of-type(11):before { content: "Total Laps"; }
        	.standings td:nth-of-type(12):before { content: "Incidents per Race"; }

        	.archive td:nth-of-type(1):before { content: "Season"; }
        	.archive td:nth-of-type(2):before { content: "1st"; }
        	.archive td:nth-of-type(3):before { content: "2nd"; }
        	.archive td:nth-of-type(4):before { content: "3rd"; }
        }
      `}</style>
    
  		<h2 className="text-center">{props.name} Standings</h2>
      <h6 className="text-center" style={{ margin: "1rem 0 2rem" }}>After {props.results.filter(({ counts }) => counts).length} of {props.schedule.filter(({ counts }) => counts).length} Races</h6>

      <table className="standings">
        <thead>
          <tr>
            <th width="2%"></th>
            <th width="2%"></th>
            <th>Driver</th>
            <th width="7%">Starts</th>
            <th width="7%">Points</th>
            <th width="7%">Behind Next</th>
            <th width="7%">Behind Leader</th>
            <th width="7%">Wins</th>
            <th width="7%">Top 5s</th>
            <th width="7%">Top 10s</th>
            <th width="7%">Total Laps</th>
            <th width="7%">Incidents per&nbsp;Race</th>
          </tr>
        </thead>
        <tbody>
          { props.standings &&
              props.standings.map((driver, index) => ( driver.driver &&
                <tr key={index} style={{opacity: driver.driver.active ? 1 : 0.3}}>
                  <td><b>{index + 1}</b></td>
                  <td>
                  { parseInt(driver.change, 10) > 0
                      ? <span style={{color:"green"}}>&#9650;&nbsp;{driver.change.substr(1)}</span>
                      : parseInt(driver.change, 10) < 0
                        ? <span style={{color:"red"}}>&#9660;&nbsp;{driver.change.substr(1)}</span>
                        : '\u00a0'
                  }
                  </td>
                  <td><DriverChip {...driver.driver}/></td>
                  <td>{driver.starts}</td>
                  <td>{driver.points}</td>
                  <td>{driver.behindNext}</td>
                  <td>{driver.behindLeader}</td>
                  <td>{driver.wins}</td>
                  <td>{driver.t5s}</td>
                  <td>{driver.t10s}</td>
                  <td>{driver.laps}</td>
                  <td>{(driver.incidents / driver.starts).toFixed(2)}</td>
                </tr>
              ))
          }
        </tbody>
      </table> 
      
      <h3 style={{ marginTop: "3rem" }}>Other Seasons</h3>

  		<table className="archive">
        <thead>
          <tr>
            <th></th>
            <th className="hide-sm" width="20%">1st</th>
            <th className="hide-sm" width="20%">2nd</th>
            <th className="hide-sm" width="20%">3rd</th>
          </tr>
        </thead>
  		  <tbody>
    			{ props.seasons.map(season => (
              <tr key={season.id}>
                <td><a href={`/standings/${season.id}/`}>{season.name}</a></td>
          			<td className="hide-sm">
                  { season.standings.length > 0 && <DriverChip {...season.standings[0].driver}/> }
                </td>
          			<td className="hide-sm">
                  { season.standings.length > 0 && <DriverChip {...season.standings[1].driver}/> }
                </td>
          			<td className="hide-sm">
                  { season.standings.length > 0 && <DriverChip {...season.standings[2].driver}/> }
                </td>
        		  </tr>
        		))
    			}
  		  </tbody>
  		</table>

  	</div>
  )
}