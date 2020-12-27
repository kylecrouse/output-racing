import Head from 'next/head'
import React from 'react';
import styles from '../styles/Home.module.css'
import league from '../lib/league/cache';
import Navbar from '../components/Navbar';

export default function Rules(props) {
  return (
    <div>
      <Head>
        <title>{props.leagueName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar seasonId={props.seasonId}/>
      
      <div className="container">
        
        <main className="columns">
          <div className="column col-6 col-mx-auto">
            
            { props.raceInfo && 
              <div>
                <h2 className="text-center">Race Information</h2>
                { props.raceInfo.content.map(el => renderNode(el)) }
              </div>
            }

            { props.rules && 
              <div>
                <h2 className="text-center">Rules</h2>
                { props.rules.content.map(el => renderNode(el)) }
              </div>
            }

            { props.codeOfConduct && 
              <div>
                <h2 className="text-center">Code of Conduct</h2>
                { props.codeOfConduct.content.map(el => renderNode(el)) }
              </div>
            }

          </div>
        </main>
        
      </div>

    </div>
  )
}

export async function getStaticProps() {
  // Get data from CMS
  const { name, rules, raceInfo, codeOfConduct, season } = await league.load();

  return { props: { 
    leagueName: name,
    seasonId: season.id,
    rules,
    raceInfo,
    codeOfConduct
  }};
}

function renderNode({ data, nodeType, content, marks, value }) {
  console.log(data, nodeType);
  switch(nodeType) {
    case 'heading-3':
      return <h3>{content.map(el => renderNode(el))}</h3>;
    case 'paragraph':
      return <p>{content.map(el => renderNode(el))}</p>;
    case 'unordered-list':
      return <ul>{content.map(el => renderNode(el))}</ul>;
    case 'ordered-list':
      return <ol>{content.map(el => renderNode(el))}</ol>;
    case 'list-item':
      return <li>{content.map(el => renderNode(el))}</li>;
    case 'hyperlink':
      return <a href={data.uri}>{content.map(el => renderNode(el))}</a>
    case 'text':
      return marks.length > 0 
        ? marks.reduce((html, el) => renderMark(el, html), value)
        : value;
  }
}

function renderMark(mark, content) {
  // console.log(mark, content);
  switch(mark.type) {
    case 'bold':
      return <b>{content}</b>;
    case 'italic':
      return <i>{content}</i>;
    default:
      return content;
  }
}