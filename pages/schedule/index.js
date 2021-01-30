import Head from 'next/head'
import league from '../../lib/league/cache';
import Navbar from '../../components/Navbar'
import Schedule from '../../components/Schedule'
import Footer from '../../components/Footer';

export default function(props) {
  return (
	  <div>
  	  <Head>
    		<title>{props.leagueName} | {props.name}</title>
    		<link rel="icon" href="/favicon.ico" />
  	  </Head>

      <Navbar page="schedule"/>
      
	    <main className="container">
	  	  <div className="columns">
          <div className="column col-8 col-xl-12 col-mx-auto">

            <Schedule { ...props } />

          </div>
        </div>
		  
	  </main>

    <Footer {...props}/>

	</div>
  )
}

export async function getStaticProps({ params }) {
  const { name, season, seasons } = await league.load();

  return { props: { 
    leagueName: name,
    ...season,
    seasons: seasons.filter(({ id }) => id !== season.id),
  }};
};
