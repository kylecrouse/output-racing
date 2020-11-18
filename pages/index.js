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

      <main className={styles.main}>
        <h1 className={styles.title}>
          Output Racing
        </h1>

        <p className={styles.description}>
          Current Drivers
        </p>

        <table border="1" cellpadding="5">
          { 
            props.drivers
              .sort((a, b) => parseInt(a.fields.number) > parseInt(b.fields.number))
              .map(driver => <Driver {...driver.fields}/>) 
          }
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
  console.log(props);
  return (
    <tr>
      <td>{props.name}</td>
      <td>{props.number}</td>
    </tr>
  );
}