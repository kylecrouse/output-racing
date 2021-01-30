import Head from 'next/head'
import styles from '../styles/Home.module.css'
import league from '../lib/league/cache';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RichText from '../components/RichText';

export default function Rules(props) {
  return (
    <div>
      <Head>
        <title>{props.leagueName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar page="rules"/>
      
      <div className="container">
        
        <main className="columns">
          <div className="column col-6 col-md-8 col-sm-12 col-mx-auto">
            
            { props.raceInfo && 
              <div>
                <h2 className="text-center">Race Information</h2>
                <RichText {...props.raceInfo}/>
              </div>
            }

            { props.rules && 
              <div>
                <h2 className="text-center">Rules</h2>
                <RichText {...props.rules}/>
              </div>
            }

            { props.codeOfConduct && 
              <div>
                <h2 className="text-center">Code of Conduct</h2>
                <RichText {...props.codeOfConduct}/>
              </div>
            }

          </div>
        </main>
        
      </div>

      <Footer {...props}/>

    </div>
  )
}

export async function getStaticProps() {
  // Get data from CMS
  const { name, rules, raceInfo, codeOfConduct } = await league.load();

  return { props: { 
    leagueName: name,
    rules,
    raceInfo,
    codeOfConduct
  }};
}
