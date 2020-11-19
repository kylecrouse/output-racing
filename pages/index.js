import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { createClient } from 'contentful'

const client = createClient({
  space: '38idy44jf6uy',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Home(props) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Output Racing</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.navBar}>
        <h1>Output Racing</h1>
      </div>
      
      <main className={styles.main}>

        <table border="1" cellPadding="5" style={{margin: "8rem 0 5rem"}}>
          <thead>
            <tr>
              <th>Driver</th>
              <th>Number</th>
            </tr>
          </thead>
          <tbody>
            { 
              props.drivers
                .sort((a, b) => parseInt(a.fields.number) > parseInt(b.fields.number))
                .map(driver => <Driver {...driver.fields}/>) 
            }
          </tbody>
        </table>
          
      </main>

    </div>
  )
}

Home.getInitialProps = async () => {
  const entries = await client.getEntries({ 
    content_type: "driver"
  });
  
  return { drivers: entries.items };
};

function Driver(props) {
  return (
    <tr key={props.custId}>
      <td>{props.name}</td>
      <td>{props.number}</td>
    </tr>
  );
}