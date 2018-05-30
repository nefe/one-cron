import * as React from 'react';
import * as ReactDOM from 'react-dom';
import OneCron from '../src';
require<any>('./index.css');


type State = {
  
};

class App extends React.Component<any, State> {
  state: State = {
    
  };
  render() {
    return (
      <div style={{margin:50}}>
       <OneCron/>
        
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
