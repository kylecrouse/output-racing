import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { createClient } from 'contentful'

const client = createClient({
  space: '38idy44jf6uy',
  environment: 'master',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Driver(props) {
  return (
	<div className={styles.container}>
	  <Head>
  		<title>Output Racing</title>
  		<link rel="icon" href="/favicon.ico" />
	  </Head>
    
    <div className={styles.navBar}>
      <h1>Output Racing</h1>
    </div>

	  <main className={styles.main} style={{marginTop: "5rem", paddingTop: "5rem"}}>

      <div>
        { props.numberArt &&
            <img src={ props.numberArt.fields.file.url } style={{ float: "left", width: "200px", marginTop: "-1rem", marginRight: "2rem" }}/>
        }
        <div style={{ float: "right" }}>
          <h2>{props.nickname || props.name}</h2>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            <li><span style={{backgroundColor: `#${props.license.licColor}`, color: 'white'}}> {props.license.licGroupDisplayName} {props.license.srPrime}.{props.license.srSub}</span></li>
            <li>iRating: {props.license.iRating}</li>
          </ul>
        </div>

      </div>
  
  		<table border="1" cellPadding="5" style={{ margin: "2rem 0" }}>
        <thead>
          <tr>
            <th>Starts</th>
            <th>Wins</th>
            <th>Top 5s</th>
            <th>Poles</th>
            <th>Avg Start</th>
            <th>Avg Finish</th>
            <th>Total Laps</th>
            <th>Laps Led</th>
            <th>Inc/Race</th>
            <th>Pts/Race</th>
            <th>W%</th>
            <th>T5%</th>
            <th>Led%</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{props.careerStats.starts}</td>
            <td>{props.careerStats.wins}</td>
            <td>{props.careerStats.top5}</td>
            <td>{props.careerStats.poles}</td>
            <td>{props.careerStats.avgStart}</td>
            <td>{props.careerStats.avgFinish}</td>
            <td>{props.careerStats.totalLaps}</td>
            <td>{props.careerStats.lapsLed}</td>
            <td>{props.careerStats.avgIncPerRace.toFixed(2)}</td>
            <td>{props.careerStats.avgPtsPerRace}</td>
            <td>{props.careerStats.winPerc.toFixed(2)}</td>
            <td>{props.careerStats.top5Perc.toFixed(2)}</td>
            <td>{props.careerStats.lapsLedPerc.toFixed(2)}</td>
          </tr>
        </tbody>
  		</table>
      
	  </main>

	</div>
  )
}

export async function getStaticPaths() {
  const entries = await client.getEntries({ content_type: 'driver' });
  return {
    paths: entries.items.map(entry => ({ params: { custId: entry.fields.custId.toString() }})),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const entries = await client.getEntries({ content_type: 'driver', 'fields.custId': params.custId });
  return { props: { ...entries.items[0].fields }};
};
