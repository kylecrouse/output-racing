import moment from 'moment';
import DriverChip from './DriverChip'

export default function Stats(props) {
  return (
  	<div>
	    
      <style jsx>{`
        .stats th:nth-of-type(1) ~ th {
          width: 6%;
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
        	.stats td:nth-of-type(1):before { content: "Driver"; }
        	.stats td:nth-of-type(2):before { content: "Starts"; }
        	.stats td:nth-of-type(3):before { content: "Wins"; }
        	.stats td:nth-of-type(4):before { content: "Top 5s"; }
        	.stats td:nth-of-type(5):before { content: "Poles"; }
        	.stats td:nth-of-type(6):before { content: "Avg Start"; }
        	.stats td:nth-of-type(7):before { content: "Avg Finish"; }
        	.stats td:nth-of-type(8):before { content: "Total Laps"; }
        	.stats td:nth-of-type(9):before { content: "Laps Led"; }
        	.stats td:nth-of-type(10):before { content: "Inc/Race"; }
        	.stats td:nth-of-type(11):before { content: "Win %"; }
        	.stats td:nth-of-type(12):before { content: "Top 5 %"; }
        	.stats td:nth-of-type(13):before { content: "Led %"; }

        	.archive td:nth-of-type(1):before { content: "Season"; }
        	.archive td:nth-of-type(2):before { content: "1st"; }
        	.archive td:nth-of-type(3):before { content: "2nd"; }
        	.archive td:nth-of-type(4):before { content: "3rd"; }
        }
      `}</style>
    
  		<h2 className="text-center" style={{ marginBottom: "2rem" }}>{props.name} Stats</h2>

      <table className="stats">
        <thead>
          <tr>
            <th>Driver</th>
            <th>Starts</th>
            <th>Wins</th>
            <th>Top 5s</th>
            <th>Poles</th>
            <th>Avg Start</th>
            <th>Avg Finish</th>
            <th>Total Laps</th>
            <th>Laps Led</th>
            <th>Inc/Race</th>
            <th>Win %</th>
            <th>Top 5 %</th>
            <th>Led %</th>
          </tr>
        </thead>
        <tbody>
          { props.stats &&
              props.stats.map((props, index) => ( props.driver &&
                <tr key={index} style={{opacity: props.driver.active ? 1 : 0.3}}>
                  <td><DriverChip {...props.driver}/></td>
                  <td>{props.starts}</td>
                  <td>{props.wins}</td>
                  <td>{props.top5s}</td>
                  <td>{props.poles}</td>
                  <td>{props.avgStart}</td>
                  <td>{props.avgFinish}</td>
                  <td>{props.laps}</td>
                  <td>{props.lapsLed}</td>
                  <td>{props.incidentsRace}</td>
                  <td>{props.winPercentage}</td>
                  <td>{props.top5Percentage}</td>
                  <td>{((parseInt(props.lapsLed) / parseInt((props.laps || '0').replace(',',''))) * 100).toFixed(0)}%</td>
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
              <tr key={props.id}>
                <td><a href={`/stats/${season.id}/`}>{season.name}</a></td>
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