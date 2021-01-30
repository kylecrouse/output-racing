import Head from 'next/head'
import league from '../../lib/league/cache';
import Navbar from '../../components/Navbar'
import Race from '../../components/Race'
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
          
            <Race { ...props } />
            
          </div>
        </div>
		  
  	  </main>

      <Footer {...props}/>

  	</div>
  )
}

export async function getStaticPaths() {
  const { seasons } = await league.load();
  return {
    paths: seasons
      .filter(season => season.results)
      .reduce(
        (ids, season) => ids.concat(
          season.results.map(item => ({ params: { raceId: item.raceId.toString() }}))
        ),
        []
      ),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const { name, seasons } = await league.load();
  
  const season = seasons
    .filter(season => season.results)
    .find(
      season => season.results.find(item => item.raceId == params.raceId)
    );
  
  const race = season.results.find(item => item.raceId == params.raceId);
  
  return { props: { 
    leagueName: name,
    ...race 
  }};
};
