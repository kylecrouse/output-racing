import Head from 'next/head'
import { createClient } from 'contentful'
import Navbar from '../components/Navbar'
import { leagueId } from '../constants'

const client = createClient({
  space: '38idy44jf6uy',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Drivers(props) {
  return (
	<div>
	  <Head>
  		<title>{props.league.name} | Drivers</title>
  		<link rel="icon" href="/favicon.ico" />
	  </Head>

    <Navbar seasonId={props.league.activeSeason.sys.id}/>
    
    <main className="container">
  	  <div className="columns">
        <div className="column col-8 col-mx-auto">
    
          <h2>Drivers</h2>

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
        			{ props.drivers.map(({ sys, fields: props }) => (
                  <tr key={props.custId}>
                    <td className="number">
                      { props.numberArt
                          ? <img src={ props.numberArt.fields.file.url } className="numberArt"/>
                          : props.number
                      }
                    </td>
                    <td className="name">
                      <a href={`/driver/${sys.id}.html`}>{props.nickname || props.name}</a>
                    </td>
                    <td>{props.leagueStats.starts || 0}</td>
                    <td>{props.leagueStats.wins || 0} <span>({props.leagueStats.winPercentage || 0})</span></td>
                    <td>{props.leagueStats.top5s || 0} <span>({props.leagueStats.top5Percentage || 0})</span></td>
                    <td>{props.leagueStats.poles || 0} <span>({((props.leagueStats.poles || 0) / (props.leagueStats.starts || 1) * 100).toFixed(0)}%)</span></td>
                  </tr>
                )) 
        			}
      		  </tbody>
      		</table>
          
        </div>
      </div>
		  
	  </main>

	</div>
  )
}

export async function getStaticProps() {
  const league = await client.getEntry(leagueId);
  const entries = await client.getEntries({ content_type: "driver", limit: 500 });
  return { props: {
    league: league.fields,
    drivers: entries.items
      .filter(({ fields }) => fields.active)
      .sort((a, b) => parseInt(a.fields.number, 10) - parseInt(b.fields.number, 10))
      .map(({ sys, fields }) => ({ 
        sys, 
        fields: { 
          ...fields, 
          leagueStats: league.fields.stats.find(({ driver }) => driver === fields.name) || {}
        }
      }))
  }};
}