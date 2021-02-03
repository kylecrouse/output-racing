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

export async function getStaticProps({ params }) {
  const { name, season, seasons } = await league.load();
  
  if (season.results) {
    const [race] = season.results.slice(-1);
    return { props: { 
      leagueName: name,
      ...race 
    }};
  } else {
    const [race] = seasons[1].results.slice(-1);
    return { props: { 
      leagueName: name,
      ...race 
    }};
  }
};
