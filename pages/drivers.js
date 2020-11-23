import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { createClient } from 'contentful'

const client = createClient({
  space: '38idy44jf6uy',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Drivers(props) {
  return (
	<div className={styles.container}>
	  <Head>
		<title>Output Racing</title>
		<link rel="icon" href="/favicon.ico" />
	  </Head>

    <div className={styles.navBar}>
    <h1 className={styles.header}>Output Racing</h1>
    <ul className={styles.nav}>
      <li><a href="/drivers.html">Drivers</a></li>
      <li><a href="/schedule/10398.html">Schedule</a></li>
      <li><a href="/standings/10398.html">Standings</a></li>
    </ul>
    </div>
	  
	  <main className={styles.main} style={{ marginTop: "5rem" }}>
    
    <h2 style={{ marginTop: "5rem" }}>Drivers</h2>

		<table border="1" cellPadding="10" style={{margin: "2rem 0 5rem"}}>
		  <tbody>
			{ props.drivers.map(({ fields: props }) => (
          <tr key={props.custId}>
            <td>
              { props.numberArt
                  ? <img src={ props.numberArt.fields.file.url } style={{ width: "50px" }}/>
                  : props.number
              }
            </td>
            <td style={{ fontSize: "1.5rem" }}>{props.name}</td>
          </tr>
        )) 
			}
		  </tbody>
		</table>
		  
	  </main>

	</div>
  )
}

export async function getStaticProps() {
  const entries = await client.getEntries({ 
  	content_type: "driver"
  });
  return { props: {
    drivers: entries.items
      .filter(({ fields }) => fields.active)
      .sort((a, b) => parseInt(a.fields.number, 10) - parseInt(b.fields.number, 10))
  }};
}