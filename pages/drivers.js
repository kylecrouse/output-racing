import Head from 'next/head'
import styles from '../styles/Drivers.module.css';
import league from '../lib/league/cache';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer';

export default function Drivers(props) {
  return (
	<div>
	  <Head>
  		<title>{props.leagueName} | Drivers</title>
  		<link rel="icon" href="/favicon.ico" />
	  </Head>

    <Navbar page="drivers"/>
    
    <main className="container">
  	  <div className="columns">
        <div className="column col-8 col-xl-12 col-mx-auto">
    
          <h2 className="text-center">Drivers</h2>

      		<table>
            <thead>
              <tr>
                <th colSpan="2"></th>
                <th className="hide-sm">Starts</th>
                <th className="hide-sm">Wins</th>
                <th className="hide-sm">Top 5s</th>
                <th className="hide-sm">Poles</th>
              </tr>
            </thead>
      		  <tbody>
        			{ props.drivers.map(props => (
                  <tr key={props.custId}>
                    <td className={styles.number}>
                      { props.numberArt
                          ? <img src={ props.numberArt.fields.file.url } className={styles.numberArt}/>
                          : props.number
                      }
                    </td>
                    <td className={styles.name}>
                      <a href={`/driver/${props.name.replace(/\s/g, '-').toLowerCase()}/`}>{props.nickname || props.name}</a>
                    </td>
                    <td className="hide-sm">{props.leagueStats.starts || 0}</td>
                    <td className="hide-sm">{props.leagueStats.wins || 0}&nbsp;<span>({props.leagueStats.winPercentage || 0})</span></td>
                    <td className="hide-sm">{props.leagueStats.top5s || 0}&nbsp;<span>({props.leagueStats.top5Percentage || 0})</span></td>
                    <td className="hide-sm">{props.leagueStats.poles || 0}&nbsp;<span>({((props.leagueStats.poles || 0) / (props.leagueStats.starts || 1) * 100).toFixed(0)}%)</span></td>
                  </tr>
                )) 
        			}
      		  </tbody>
      		</table>
          
        </div>
      </div>
		  
	  </main>

    <Footer {...props}/>

	</div>
  )
}

export async function getStaticProps() {
  const { name, drivers } = await league.load();
  return { props: {
    leagueName: name,
    drivers: drivers
      .filter(driver => driver.active)
      .sort((a, b) => parseInt(a.number || 1000, 10) - parseInt(b.number || 1000, 10))
  }};
}