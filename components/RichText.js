export default function RichText({ data, nodeType, content, marks, value }) {  
  const children = Array.isArray(content) 
    ? content.map(el => <RichText {...el}/>) 
    : null;

  switch(nodeType) {
    case 'document':
      return <div>{ children }</div>;
    case 'heading-1':
      return <h1>{ children }</h1>;
    case 'heading-2':
      return <h2>{ children }</h2>;
    case 'heading-3':
      return <h3>{ children }</h3>;
    case 'heading-4':
      return <h4>{ children }</h4>;
    case 'heading-5':
      return <h5>{ children }</h5>;
    case 'heading-6':
      return <h6>{ children }</h6>;
    case 'paragraph':
      return <p>{ children }</p>;
    case 'unordered-list':
      return <ul>{ children }</ul>;
    case 'ordered-list':
      return <ol>{ children }</ol>;
    case 'list-item':
      return <li>{ children }</li>;
    case 'hyperlink':
      return <a href={data.uri}>{ children }</a>
    case 'text':
      return marks.length > 0 
        ? marks.reduce((children, el) => <Mark {...el}>{children}</Mark>, value)
        : <span>{value}</span>;
  }
}

function Mark(props) {
  switch(props.type) {
    case 'bold':
      return <b>{props.children}</b>;
    case 'italic':
      return <i>{props.children}</i>;
    default:
      return props.children;
  }
}