import * as React from 'react';
import * as ReactDOM from 'react-dom';
import OneCron from '../src';
require<any>('./index.css');


type State = {
  
};

class App extends React.Component<any, State> {
  state: State = {
    
  };
  handleChange (exp){
    console.log(exp,exp.format())
  }
  render() {
    return (
      <div style={{margin:50}}>
       <OneCron onChange={exp => this.handleChange(exp)} cronExpression="0 0-5 14 * * ?"/>
        
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
