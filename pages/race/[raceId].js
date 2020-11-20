import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { createClient } from 'contentful'
import moment from 'moment'

const client = createClient({
  space: '38idy44jf6uy',
  environment: 'master',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Race(props) {
  return (
	<div className={styles.container}>
	  <Head>
  		<title>Output Racing</title>
  		<link rel="icon" href="/favicon.ico" />
	  </Head>
    
    <div className={styles.navBar}>
      <h1>Output Racing</h1>
    </div>

    { props.broadcast &&
      <div className={styles.videoContainer}>
        <iframe className={styles.video} src={props.broadcast} allowFullScreen></iframe>
      </div>
    }
    
	  <main className={styles.main}>

      <div>
        <img src="https://d3bxz2vegbjddt.cloudfront.net/members/member_images/tracks/phoenix/2014/logo.jpg" style={{ float: "left", marginRight: "2rem" }}/>
        <div style={{ float: "right" }}>
          <h2>{props.track}</h2>
          <h3>{moment(props.date).format('MMMM Do, YYYY')}</h3>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            <li>{props.laps} laps ({props.duration})</li>
            <li>{props.cautions} cautions for {props.cautionLaps} laps</li>
            <li>{props.leadChanges} lead changes between {props.leaders} drivers</li>
          </ul>
        </div>

      </div>
  
  		<table border="1" cellPadding="5" style={{ margin: "2rem 0" }}>
      <thead>
        <tr>
          <th>Finish</th>
          <th>Start</th>
          <th>Driver</th>
          <th>Points</th>
          <th>Interval</th>
          <th>Laps</th>
          <th>Led</th>
          <th>Fastest</th>
          <th>Average</th>
          <th>Incidents</th>
          <th>Status</th>
        </tr>
        </thead>
        <tbody>
  		  { 
  			props.results
  			  .sort((a, b) => parseInt(a.finish, 10) > parseInt(b.finish, 10))
  			  .map(props => (
            <tr key={props.custId}>
              <td>{props.finish}</td>
              <td>{props.start}</td>
              <td><a href={`/driver/${props.custId}`}>{props.nickname || props.name}</a></td>
              <td>{props.points + props.bonus + props.penalty}</td>
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
      
      <div style={{ margin: "2rem 0", width: "80%" }}>
        { props.media.map(image => renderImage(image)) }
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
  entry.fields.results = await Promise.all(entry.fields.results.map(async (item) => {
    const driver = await client.getEntry(item.driver);
    return { ...item, ...driver.fields };
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
