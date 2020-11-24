import Head from 'next/head'
import { createClient } from 'contentful'
import moment from 'moment';
import Navbar from '../../components/Navbar'

const client = createClient({
  space: '38idy44jf6uy',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Schedule(props) {
  return (
	  <div>
  	  <Head>
    		<title>Output Racing | {props.name}</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>

      <Navbar/>
      
	    <main className="container">
	  	  <div className="columns">
          <div className="column col-8 col-mx-auto">

          	<h2>Schedule</h2>

        		<table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th>Track</th>
                  <th>Laps</th>
                </tr>
              </thead>
        		  <tbody>
          			{ props.schedule.filter(({ raceNo }) => raceNo !== "").map((race) => (
              		  <tr key={props.raceNo}>
                      <td>{moment(race.date).format('MMM D, YYYY')}</td>
                			<td>
                        { race.raceId 
                            ? <a href={`/race/${race.raceId}.html`}>{race.name}</a>
                            : race.name
                        }
                      </td>
                			<td>{race.track}</td>
                      <td>{race.laps}</td>
              		  </tr>
              		)) 
          			}
        		  </tbody>
        		</table>
            
          </div>
        </div>
		  
	  </main>

	</div>
  )
}

export async function getStaticPaths() {
  const entries = await client.getEntries({ content_type: 'season' });
  return {
  	paths: entries.items.map(entry => ({ params: { seasonId: entry.sys.id }})),
  	fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const season = await client.getEntry(params.seasonId);
  const races = await client.getEntries({ content_type: "race" });
  const drivers = await client.getEntries({ content_type: "driver" });
  return { props: { 
    ...season.fields,
    schedule: season.fields.schedule.map((schedule) => {
      const race = races.items.find(({ sys }) => sys.id === schedule.raceId);
      return race ? { ...schedule, ...race.fields } : schedule;
    }), 
    drivers: drivers.items 
  }};
};
