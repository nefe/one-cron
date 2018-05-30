import * as React from 'react';
import { Select, Checkbox, TimePicker, Radio } from 'antd';
import './index.css';

const Option = Select.Option;

export default class OneCron extends React.Component<any, any> {
  render() {
    return (
      <div>
        <Select defaultValue="lucy" style={{ width: 120 }} >
          <Option value="jack">Jack</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="disabled" disabled>Disabled</Option>
          <Option value="Yiminghe">yiminghe</Option>
        </Select>
      </div>
    )
  }
}

