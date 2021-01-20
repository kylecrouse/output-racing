import Head from 'next/head'
import league from '../../lib/league/cache';
import Navbar from '../../components/Navbar'
import Stats from '../../components/Stats'
import Footer from '../../components/Footer';

export default function StatsPage(props) {
  return (
  	<div>
  	  <Head>
    		<title>{props.leagueName} | Stats</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>

      <Navbar/>
      
      <main className="container">
	  	  <div className="columns">
          <div className="column col-8 col-xl-12 col-mx-auto">
	
            <Stats { ...props } />
            
          </div>
        </div>           
		  
  	  </main>

      <Footer {...props}/>

  	</div>
  )
}

export async function getStaticProps({ params }) {
  const { name, season, seasons, drivers } = await league.load();

  return { props: {
    leagueName: name,
    ...season,
    stats: season.stats
      .sort((a, b) => b.starts - a.starts || b.wins - a.wins || b.top5s - a.top5s || a.avgFinish - b.avgFinish)
      .map(
        props => ({ 
          ...props, 
          driver: drivers.find(
            driver => driver.id === props.id || driver.name === props.driver
          ) || props.driver 
        })
      ),
    seasons: seasons.filter(({ id }) => id !== season.id)
  }};
};
