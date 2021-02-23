import moment from 'moment';
import DriverChip from './DriverChip'
import RichText from './RichText';
import { cars } from '../constants'

export default function Schedule(props) {
  return (
	  <div>

      <style jsx>{`
        @media only screen and (max-width: 760px), (min-device-width: 768px) and (max-device-width: 1024px) {
        
        	/* Force table to not be like tables anymore */
        	#schedule, #schedule thead, #schedule tbody, #schedule th, #schedule td, #schedule tr { 
        		display: block; 
        	}
          
        	/* Hide table headers (but not display: none;, for accessibility) */
        	#schedule thead tr { 
        		position: absolute;
        		top: -9999px;
        		left: -9999px;
        	}
          
          #schedule tbody tr {
            margin-bottom: 1rem;
          }
          
        	#schedule td { 
        		/* Behave  like a "row" */
        		border: none;
        		border-bottom: 1px solid #eee; 
        		position: relative;
        		padding-left: 30%; 
            text-align: right;
        	}
          
          #schedule tbody tr:nth-child(odd) td {
            border-bottom-color: white;
          }
          
          #schedule td:last-child {
            border-bottom: 0;
        	}
          
        	#schedule td:before { 
        		/* Now like a table header */
        		position: absolute;
        		/* Top/left values mimic padding */
        		top: 6px;
        		left: 6px;
        		width: 25%; 
        		padding-right: 10px; 
        		white-space: nowrap;
            text-align: left;
            font-weight: bold;
        	}
        	
        	/*
        	Label the data
        	*/
        	#schedule td:nth-of-type(1):before { content: "Date"; }
        	#schedule td:nth-of-type(2):before { content: "Event"; }
        	#schedule td:nth-of-type(3):before { content: "Track"; }
        	#schedule td:nth-of-type(4):before { content: "Duration"; }
        }
      `}</style>
            
  	<h2 className="text-center">{props.name} Schedule</h2>
    
    <div class="columns" style={{ margin: "2rem 0" }}>
      { props.description &&
        <div class="column col-6 col-sm-12 col-mx-auto">
          <RichText {...props.description}/>
          <p>
            <a href="/apply" className="btn btn-primary"><span>Apply</span></a>
          </p>
        </div>
      }
      { props.cars && 
          <div class="column col-6 col-sm-12 col-mx-auto">
            { props.cars.map(name => {
                const car = cars.find(car => car.name === name);
                return (
                  <figure key={car.id} className={`text-center`} style={{ overflow: "hidden", margin: "0 0 1rem" }}>
                    <img src={car.image} alt={car.name} style={{ maxHeight: "150px", maxWidth: "102%", marginLeft: "-1%" }}/>
                    <figcaption style={{ fontSize: "0.6rem" }}>{car.name}</figcaption>
                  </figure>
                );
              })
            }
          </div>
      }
    </div>

		<table id="schedule">
      <thead>
        <tr>
          <th width="13%">Date</th>
          <th>Event</th>
          <th width="42%">Track</th>
          <th width="5%">Duration</th>
        </tr>
      </thead>
		  <tbody>
  			{ props.schedule.filter(({ raceNo }) => raceNo !== "").map((race) => (
      		  <tr key={props.raceNo}>
              <td style={{ whiteSpace: "nowrap" }}>{moment.parseZone(race.date).format('MMM D, YYYY')}</td>
        			<td>
                { race.raceId 
                    ? <a href={`/results/${race.raceId}/`}>{race.name}</a>
                    : race.offWeek ? <i>{race.name}</i> : race.name
                }
                { !race.counts && !race.offWeek && <i style={{opacity:0.5}}> (non-points)</i>}
              </td>
        			<td>{race.track}</td>
              <td>{race.laps ? `${race.laps}\u00A0laps` : race.time}</td>
      		  </tr>
      		)) 
  			}
		  </tbody>
		</table>
    
    <h3 style={{ marginTop: "3rem" }}>Other Seasons</h3>

		<table>
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
              <td><a href={`/schedule/${season.id}/`}>{season.name}</a></td>
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
