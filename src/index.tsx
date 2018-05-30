import * as React from "react";
import { Select, Checkbox, TimePicker, Radio } from "antd";
import "./index.css";
import RadioGroup from 'antd/lib/radio/group';
import {
  Cron,
  periodItems,
  PeriodType,
  AllCron,
  DayCron,
  weekItems,
  dayItems,
  stepItems,
  hourItems
} from "./cronUtils";

console.log(hourItems, weekItems);
const Option = Select.Option;

function getOptions(items: Item[]) {
  return items.map(item => {
    return (
      <Option key={item.value} value={item.value}>
        {item.text}
      </Option>
    );
  });
}

export class OneCronProps {
  cronExpression: string;
  onChange?: (cron: AllCron) => any;
}
interface OneCronState {
  cron: AllCron;
  cronType: PeriodType;
  isEmpty: boolean;
}
export default class OneCron extends React.Component<
  OneCronProps,
  OneCronState
> {
  constructor(props: OneCronProps) {
    super(props);
    const cron = Cron.getCronFromExp(props.cronExpression);

    this.state = {
      cron,
      cronType: cron.periodType,
      isEmpty: !props.cronExpression
    };
  }
  handleChangePeriodType(periodType: PeriodType) {
    this.setState(
      {
        cron: Cron.getCronFromPeriodType(periodType),
        cronType: periodType
      },
      () => {
        this.props.onChange(this.state.cron);
      }
    );
  }

  triggerChange() {
    this.props.onChange(this.state.cron);
    this.forceUpdate();
  }

  renderDetail() {
    const { cron } = this.state;
    const getCommonProps = <T extends any, Key extends keyof T>(cronBO: T, key: Key) => {
      return {
        value: cronBO[key],
        onChange: value => {
          cronBO[key] = value;
          this.triggerChange();
        }
      };
    };

    switch (cron.periodType) {
      case PeriodType.day: {
        if (!cron.isSchedule) {
          return null;
        }

        return <TimePicker format="HH:mm" {...getCommonProps(cron, 'time')} />;
      }

      case PeriodType.week: {
        return (
          <span>
            <Select mode="tags" style={{ width: 200 }} {...getCommonProps(cron, 'weeks')}>
              {getOptions(weekItems)}
            </Select>
            <TimePicker format="HH:mm" {...getCommonProps(cron, 'time')} />
          </span>
        );
      }

      case PeriodType.month: {
        return (
          <span>
            <Select mode="tags" style={{ width: 200 }} {...getCommonProps(cron, 'days')}>
              {getOptions(dayItems)}
            </Select>
            <TimePicker format="HH:mm" {...getCommonProps(cron, 'time')} />
          </span>
        );
      }

      case PeriodType.minute: {
        return (
          <span>
            <span className="form-item">
              <span className="form-item-title">开始</span>
              <TimePicker format="HH:mm" {...getCommonProps(cron, 'beginTime')} />
            </span>
            <span className="form-item">
              <span className="form-item-title">间隔</span>
              <Select {...getCommonProps(cron, 'stepMinute')}>{getOptions(stepItems)}</Select>
            </span>
            <span className="form-item">
              <span className="form-item-title">结束</span>
              <TimePicker format="HH:mm" {...getCommonProps(cron, 'endTime')} />
            </span>
          </span>
        );
      }

      case PeriodType.hour: {
        return (
          <span>
            <RadioGroup
              value={cron.hasInterval ? 'step' : 'point'}
              onChange={e => {
                cron.hasInterval = e.target.value === 'step';
                this.triggerChange();
              }}>
              <Radio value="step">时间段</Radio>
              <Radio value="point">时间点</Radio>
            </RadioGroup>
            {cron.hasInterval ? (
              <span>
                <span className="form-item">
                  <span className="form-item-title">开始</span>
                  <TimePicker format="HH:mm" {...getCommonProps(cron, 'beginTime')} />
                </span>
                <span className="form-item">
                  <span className="form-item-title">间隔</span>
                  <Select {...getCommonProps(cron, 'stepHour')}>{getOptions(stepItems)}</Select>
                </span>
                <span className="form-item">
                  <span className="form-item-title">结束</span>
                  <TimePicker format="HH:mm" {...getCommonProps(cron, 'endTime')} />
                </span>
              </span>
            ) : (
              <Select
                mode="tags"
                value={cron.hours}
                onChange={(value: string[]) => {
                  cron.hours = value;
                  this.triggerChange();
                }}>
                {getOptions(hourItems)}
              </Select>
            )}
          </span>
        );
      }

      default: {
        return null;
      }
    }
  }

  render() {
    const { cronExpression, onChange } = this.props;
    const { cron } = this.state;
    return (
      <span className="schedule-period">
        <Select
          value={cron.periodType}
          onChange={this.handleChangePeriodType.bind(this)}
        >
          {getOptions(periodItems)}
        </Select>
        <Checkbox
          onChange={e => {
            (cron as DayCron).changeIsSchedule(e.target.checked);
            this.triggerChange();
          }}
          disabled={cron.periodType !== PeriodType.day}
          checked={cron.periodType !== PeriodType.day ? true : cron.isSchedule}
        >
          定时
        </Checkbox>
        {this.renderDetail()}
      </span>
    );
  }
}
