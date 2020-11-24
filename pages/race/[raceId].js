import Head from 'next/head'
import { createClient } from 'contentful'
import moment from 'moment'
import Navbar from '../../components/Navbar'
import Video from '../../components/Video'
import DriverChip from '../../components/DriverChip'

const client = createClient({
  space: '38idy44jf6uy',
  environment: 'master',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Race(props) {
  return (
  	<div>
  	  <Head>
    		<title>Output Racing | {props.name}</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>
    
      <Navbar/>
      
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
      `}</style>

  	  <main className="container">
	  	  <div className="columns">
          <div className="column col-8 col-mx-auto">
          
            <div className="columns col-gapless" style={{ alignItems: "center" }}>
              <div className="column col-3 text-right">
                { props.logo
                    ? <img src={ props.logo.fields.file.url } style={{ display: "block", width: "100%" }} />
                    : <h3>{props.name}</h3>
                }
              </div>
              <div className="column col-6 text-center">
                <ul className="text-center">
                  <li><b>{props.track}</b></li>
                  <li>{moment(props.date).format('MMMM Do, YYYY')}</li>
                  <li style={{ marginTop: "0.5rem", fontSize: "0.6rem" }}>{props.laps} laps ({props.duration})</li>
                  <li style={{ fontSize: "0.6rem" }}>{props.cautions} cautions for {props.cautionLaps} laps</li>
                  <li style={{ fontSize: "0.6rem" }}>{props.leadChanges} lead changes between {props.leaders} drivers</li>
                </ul>
              </div>
              <div className="column col-3 text-left">
                <img src="https://d3bxz2vegbjddt.cloudfront.net/members/member_images/tracks/phoenix/2014/logo.jpg"/>
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
        			  .map(props => (
                  <tr key={props.id}>
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
        </div>
		  
  	  </main>

  	</div>
  )
}

export async function getStaticPaths() {
  const entries = await client.getEntries({ content_type: 'race' });
  return {
    paths: entries.items.map(entry => ({ params: { raceId: entry.sys.id }})),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const entry = await client.getEntry(params.raceId);
  entry.fields.results = await Promise.all(entry.fields.results
    .filter(result => result.id)
    .map(async (result) => {
      const driver = await client.getEntry(result.id);
      return { ...result, driver };
    }));
  return { props: { ...entry.fields }};
};

function renderImage(image) {
  if (image && image.fields.file) {
    return <img src={ image.fields.file.url } style={{ width: "100%", marginBottom: "2rem" }} />
  } else {
    return null
  }
}
