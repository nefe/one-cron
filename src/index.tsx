import * as React from "react";
import { Select, Checkbox, TimePicker, Radio } from "antd";

import {
  Cron,
  AllCron,
  DayCron,
  PeriodType,
  getPeriodItems,
  getWeekItems,
  getDayItems,
  getStepMinuteItems,
  getSteoHourItems,
  getHourItems
} from "./cronUtils";
import { getI18N } from "./I18N";
const Option = Select.Option;
const RadioGroup = Radio.Group;

interface Item {
  text: string;
  value: string;
}

function getOptions(items: Item[]) {
  return items.map(item => {
    return (
      <Option key={item.value} value={item.value}>
        {item.text}
      </Option>
    );
  });
}

export enum I18NEnum {
  Chinese = "Chinese",
  English = "English"
}
export class OneCronProps {
  cronExpression? = "0 0 0 * * ?";
  onChange? = (exp: AllCron) => {};
  lang? = I18NEnum.English;
  showCheckbox? = false;
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
  static defaultProps = new OneCronProps();
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
    const { lang, showCheckbox } = this.props;
    const sLang = I18NEnum[lang];
    const I18N = getI18N(sLang);
    const getCommonProps = <T extends any, Key extends keyof T>(
      cronBO: T,
      key: Key
    ) => {
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
        if (showCheckbox && !cron.isSchedule) {
          return null;
        }
        if (!showCheckbox) {
          // showCheckbox关闭，则说明默认自动调度任务
          cron.changeIsSchedule(!showCheckbox);
        }

        return <TimePicker format="HH:mm" {...getCommonProps(cron, "time")} />;
      }

      case PeriodType.week: {
        return (
          <span>
            <Select
              mode="tags"
              style={{ width: 200 }}
              {...getCommonProps(cron, "weeks")}
            >
              {getOptions(getWeekItems(sLang))}
            </Select>
            <TimePicker format="HH:mm" {...getCommonProps(cron, "time")} />
          </span>
        );
      }

      case PeriodType.month: {
        return (
          <span>
            <Select
              mode="tags"
              style={{ width: 200 }}
              {...getCommonProps(cron, "days")}
            >
              {getOptions(getDayItems(sLang))}
            </Select>
            <TimePicker format="HH:mm" {...getCommonProps(cron, "time")} />
          </span>
        );
      }

      case PeriodType.minute: {
        return (
          <span>
            <span className="form-item">
              <span className="form-item-title">{I18N.start}</span>
              <TimePicker
                format="HH:mm"
                {...getCommonProps(cron, "beginTime")}
              />
            </span>
            <span className="form-item">
              <span className="form-item-title">{I18N.step}</span>
              <Select
                style={{ width: 100 }}
                {...getCommonProps(cron, "stepMinute")}
              >
                {getOptions(getStepMinuteItems)}
              </Select>
              <span style={{ marginRight: 20 }}>{I18N.stepMinuteUnit}</span>
            </span>
            <span className="form-item">
              <span className="form-item-title">{I18N.end}</span>
              <TimePicker format="HH:mm" {...getCommonProps(cron, "endTime")} />
            </span>
          </span>
        );
      }

      case PeriodType.hour: {
        return (
          <span>
            <RadioGroup
              value={cron.hasInterval ? "step" : "point"}
              onChange={e => {
                cron.hasInterval = e.target.value === "step";
                this.triggerChange();
              }}
            >
              <Radio value="step">{I18N.period}</Radio>
              <Radio value="point">{I18N.point}</Radio>
            </RadioGroup>
            {cron.hasInterval ? (
              <span>
                <span className="form-item">
                  <span className="form-item-title">{I18N.start}</span>
                  <TimePicker
                    format="HH:mm"
                    {...getCommonProps(cron, "beginTime")}
                  />
                </span>
                <span className="form-item">
                  <span className="form-item-title">{I18N.step}</span>
                  <Select
                    style={{ width: 100 }}
                    {...getCommonProps(cron, "stepHour")}
                  >
                    {getOptions(getSteoHourItems)}
                  </Select>
                  <span style={{ marginRight: 20 }}>{I18N.stepHourUnit}</span>
                </span>
                <span className="form-item">
                  <span className="form-item-title">{I18N.end}</span>
                  <TimePicker
                    format="HH:mm"
                    {...getCommonProps(cron, "endTime")}
                  />
                </span>
              </span>
            ) : (
              <Select
                mode="tags"
                value={cron.hours}
                style={{ width: 200 }}
                onChange={(value: string[]) => {
                  cron.hours = value;
                  this.triggerChange();
                }}
              >
                {getOptions(getHourItems(sLang))}
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
    const { cronExpression, onChange, lang, showCheckbox } = this.props;
    const sLang = I18NEnum[lang];
    const I18N = getI18N(sLang);
    const { cron } = this.state;
    return (
      <span className="schedule-period">
        <Select
          value={cron.periodType}
          onChange={this.handleChangePeriodType.bind(this)}
        >
          {getOptions(getPeriodItems(sLang))}
        </Select>
        {!!showCheckbox && (
          <Checkbox
            onChange={e => {
              (cron as DayCron).changeIsSchedule(e.target.checked);
              this.triggerChange();
            }}
            disabled={cron.periodType !== PeriodType.day}
            checked={
              cron.periodType !== PeriodType.day ? true : cron.isSchedule
            }
          >
            <span className="timing">{I18N.timing}</span>
          </Checkbox>
        )}
        {this.renderDetail()}
      </span>
    );
  }
}
