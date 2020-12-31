import Head from 'next/head'
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

    <Navbar seasonId={props.seasonId} page="drivers"/>
    
    <main className="container">
  	  <div className="columns">
        <div className="column col-8 col-xl-12 col-mx-auto">
    
          <h2 className="text-center">Drivers</h2>

          <style jsx>{`
            td {
              font-size: 0.8rem;
              text-align: center;
              width: 10%;
            }
            td span {
              color: #999;
            }
            .name {
              font-size: 1.5rem;
              padding: 0 20px;
              text-align: left; 
              width: auto;
            }
            .number {
              font-size: 2rem;
              color: #ccc;
            }
            .numberArt {
              display: block;
              width: 60%;
              margin: 0 auto; 
            }
          `}</style>
      		<table>
            <thead>
              <tr>
                <th colSpan="2"></th>
                <th>Starts</th>
                <th>Wins</th>
                <th>Top 5s</th>
                <th>Poles</th>
              </tr>
            </thead>
      		  <tbody>
        			{ props.drivers.map(props => (
                  <tr key={props.custId}>
                    <td className="number">
                      { props.numberArt
                          ? <img src={ props.numberArt.fields.file.url } className="numberArt"/>
                          : props.number
                      }
                    </td>
                    <td className="name">
                      <a href={`/driver/${props.name.replace(/\s/g, '-').toLowerCase()}/`}>{props.nickname || props.name}</a>
                    </td>
                    <td>{props.leagueStats.starts || 0}</td>
                    <td>{props.leagueStats.wins || 0}&nbsp;<span>({props.leagueStats.winPercentage || 0})</span></td>
                    <td>{props.leagueStats.top5s || 0}&nbsp;<span>({props.leagueStats.top5Percentage || 0})</span></td>
                    <td>{props.leagueStats.poles || 0}&nbsp;<span>({((props.leagueStats.poles || 0) / (props.leagueStats.starts || 1) * 100).toFixed(0)}%)</span></td>
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
  const { name, season, drivers } = await league.load();
  return { props: {
    leagueName: name,
    seasonId: season.id,
    drivers: drivers
      .filter(driver => driver.active)
      .sort((a, b) => parseInt(a.number, 10) - parseInt(b.number, 10))
  }};
}