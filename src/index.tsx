import * as React from "react";
import { Select, Checkbox, TimePicker, Radio } from "antd";
import RadioGroup from "antd/lib/radio/group";
import {
  Cron,
  periodItems,
  PeriodType,
  AllCron,
  DayCron,
  weekItems,
  dayItems,
  stepItems,
  hourItems,
  getI18N
} from "./cronUtils";

const Option = Select.Option;

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
  Chinese,
  English
}
export class OneCronProps {
  cronExpression = "0 0 0 * * ?";
  onChange = (exp: AllCron) => {};
  lang = I18NEnum.Chinese;
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
    const { lang } = this.props;
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
              {getOptions(weekItems(sLang))}
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
              {getOptions(dayItems)}
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
              <Select {...getCommonProps(cron, "stepMinute")}>
                {getOptions(stepItems)}
              </Select>
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
                  <Select {...getCommonProps(cron, "stepHour")}>
                    {getOptions(stepItems)}
                  </Select>
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
    const { cronExpression, onChange, lang } = this.props;
    const sLang = I18NEnum[lang];
    const I18N = getI18N(sLang);
    const { cron } = this.state;
    return (
      <span className="schedule-period">
        <Select
          value={cron.periodType}
          onChange={this.handleChangePeriodType.bind(this)}
        >
          {getOptions(periodItems(sLang))}
        </Select>
        {this.renderDetail()}
      </span>
    );
  }
}
