import * as React from 'react';
import * as ReactDOM from 'react-dom';
import OneCron from '../lib';
import "./index.css";

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
       <OneCron lang={1} onChange={exp => this.handleChange(exp)} cronExpression="0 3 1 ? 2,3 *"/>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
