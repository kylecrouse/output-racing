import Head from 'next/head'
import league from '../../lib/league/cache';
import Navbar from '../../components/Navbar'
import Standings from '../../components/Standings'
import Footer from '../../components/Footer';

export default function StandingsPage(props) {
  return (
  	<div>
  	  <Head>
    		<title>{props.leagueName} | Standings</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>

      <Navbar page="standings"/>
      
      <main className="container">
	  	  <div className="columns">
          <div className="column col-8 col-xl-12 col-mx-auto">
	
            <Standings { ...props } />
            
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
    seasons: seasons.filter(({ id }) => id !== season.id),
    drivers
  }};
};
