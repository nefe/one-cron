import * as React from "react";
import { Select, Checkbox, TimePicker, Radio } from "antd";
import * as Moment from "moment";
import { getArr } from "./I18N";
import './index.css';

import {
  Cron,
  AllCron,
  DayCron,
  PeriodType,
  DayOfWeekType,
  getPeriodItems,
  getWeekItems,
  getDayItems,
  getStepMinuteItems,
  getSteoHourItems,
  getHourItems,
  getPredictedTimes,
} from "./cronUtils";
import { cronValidate } from "./cronExpValidator";
import { getI18N, LangEnum } from "./I18N";
const Option = Select.Option;
const RadioGroup = Radio.Group;

interface Item {
  text: string;
  value: string;
}
type disabledtype = "start" | "end";

function getOptions(items: Item[]) {
  return items.map(item => {
    return (
      <Option key={item.value} value={item.value}>
        {item.text}
      </Option>
    );
  });
}

export * from "./cronUtils";

export class OneCronProps {
  cronExpression?: string;
  onChange? = (exp: AllCron) => {};
  /** 校验 */
  onValidate? = (error: boolean, cron: AllCron) => {};
  lang? = LangEnum.en_US;
  /** T+n */
  delay? = 1;
  showCheckbox? = false;
  disabled? = false;
  showRecentTime? = false;
  /** 可配置时间粒度 */
  options? = Object.values(PeriodType);
  /** 开始时间，用于小时选择 */
  beginTime? = 0;
  /** 结束时间，用于小时选择 */
  endTime? = 24;
  /** 是否支持多选 */
  multiple? = true;
  /** 错误信息 */
  errorMessage? = '';
  /** day of week是否从1开始。如果为true时，周日至周六对应1~7；否则从0开始，周日至周六对应0~6 */
  dayOfWeekOneBased? = true;
  /**
   * 是否严格校验cron表达式。如果为true，cron表达式的day of week字段必须是严格递增的, 
   * 例如day of week是'5,6'，则是合法的。但如果是'6,5'，则校验不通过
   */
  strictValidate? = true;
  /**
   * 展示最近生成时间的数量
   */
  recentTimeNum? = 5;
  /** 为true时表示小时调度的时间点至少需要选择两项。如果只选择一项的话，cron表达式有二义性，可以同时理解成日调度和小时调度 */
  twoHourItemsRequired? = false;
  /** 使用哪种语言的周调度定义，Linux 中周日到周六对应 0-6，Spring 中周一到周日对应 1-7，Quartz 中周日到周六对应 1-7，默认使用 Quartz */
  dayOfWeek? = DayOfWeekType.Quartz;
}
interface OneCronState {
  cron: AllCron;
  cronType: PeriodType;
  isEmpty: boolean;
  endOpen: boolean;
  timeList: string[];
  isError: boolean;
}
export default class OneCron extends React.Component<
  OneCronProps,
  OneCronState
> {
  static defaultProps = new OneCronProps();

  constructor(props: OneCronProps) {
    super(props);
    // 兼容历史 dayOfWeekOneBased 字段配置
    const dayOfWeek = props.dayOfWeekOneBased === false ? DayOfWeekType.Linux : props.dayOfWeek;
    const cron = Cron.getCronFromExp(props.cronExpression, dayOfWeek, props.strictValidate);
    cron.delay = this.props.delay;

    this.state = {
      cron,
      cronType: cron.periodType,
      isEmpty: !props.cronExpression,
      endOpen: false,
      timeList: cron.getPredictedTimes(props.recentTimeNum),
      isError: false
    };
  }

  componentWillReceiveProps(nextProps: OneCronProps) {
    if (nextProps.cronExpression !== this.props.cronExpression) {
      if (this.state.isEmpty) {
        const dayOfWeek = nextProps.dayOfWeekOneBased === false ? DayOfWeekType.Linux : nextProps.dayOfWeek;
        const newCron = Cron.getCronFromExp(nextProps.cronExpression, dayOfWeek, nextProps.strictValidate);
        newCron.delay = this.props.delay;
        const cronType =  newCron.periodType;
        this.setState({
          cron: newCron,
          cronType,
          isEmpty: false,
          timeList: newCron.getPredictedTimes(nextProps.recentTimeNum)
        });
      }
    }
  }

  handleChangePeriodType(periodType: PeriodType) {
    const dayOfWeek = this.props.dayOfWeekOneBased === false ? DayOfWeekType.Linux : this.props.dayOfWeek;
    const newCron = Cron.getCronFromPeriodType(periodType, dayOfWeek);
    newCron.delay = this.props.delay;
    this.setState(
      {
        cron: newCron,
        cronType: periodType,
        timeList: newCron.getPredictedTimes(this.props.recentTimeNum)
      },
      () => {
        this.triggerValidate(newCron);
        this.props.onChange(this.state.cron);
      }
    );
  }

  onValidate(isError:boolean){
    this.setState({
      isError
    });
    this.props.onValidate && this.props.onValidate(isError, this.state.cron);
  }

  // 校验某些选择项是否有填，当前只对week,month,hour类型进行判断
  triggerValidate(cron){
    const { twoHourItemsRequired } = this.props;

    if(cron.periodType === 'week') {
      if(cron.weeks.length === 0){
        this.onValidate(true)
      }else {
        this.onValidate(false)
      }
    }else if(cron.periodType === 'month'){
      if(cron.days.length === 0){
        this.onValidate(true);
      }else {
        this.onValidate(false)
      }
    } else if (cron.periodType === 'hour') {
      if (cron.hasInterval === false && (cron.hours.length === 0 || (twoHourItemsRequired && cron.hours.length === 1))) {
        this.onValidate(true);
      }else {
        this.onValidate(false)
      }
    } else {
      this.onValidate(false)
    }
  }

  triggerChange() {
    const timeList = this.state.cron.getPredictedTimes(this.props.recentTimeNum);
    this.setState({
      timeList
    });
    this.props.onChange(this.state.cron);
    this.triggerValidate(this.state.cron);
    this.forceUpdate();
  }

  disabledHours = (
    sTime: number,
    eTime: number,
    type: disabledtype = "end"
  ) => {
    const { beginTime, endTime } = this.props;
    if (type === "end") {
      const newTime = Math.min(eTime, endTime);
      return [
        ...getArr(beginTime, 0),
        ...getArr(24 - newTime, newTime === 0 ? 1 : newTime)
      ];
    } else {
      const newtime = Math.max(sTime, beginTime);
      return [
        ...getArr(newtime + 1, 0),
        ...getArr(24 - endTime, endTime === 0 ? 1 : endTime)
      ];
    }
  };
  handleStartOpenChange = (open: boolean) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = (open: boolean) => {
    this.setState({ endOpen: open });
  };

  renderDetail() {
    const { cron, endOpen } = this.state;
    const {
      lang,
      showCheckbox,
      disabled,
      beginTime = 0,
      endTime = 24,
      multiple,
      dayOfWeekOneBased,
    } = this.props;
    const dayOfWeek = dayOfWeekOneBased === false ? DayOfWeekType.Linux : this.props.dayOfWeek;
    const disabledHours = () => [
      ...getArr(beginTime, 0),
      ...getArr(24 - endTime, endTime === 0 ? 1 : endTime)
    ];
    const I18N = getI18N(lang);
    const getCommonProps = <T extends any, Key extends keyof T>(
      cronBO: T,
      key: Key,
      cronType?: PeriodType
    ) => {
      // 数据订正
      const isValid = Moment(cronBO[key]).isValid();
      if(isValid) {
        if (cronType === PeriodType.minute) {
          if (key === "endTime") {
            cronBO[key] = isValid ? Moment(cronBO[key], "HH:mm") as any : null;
          } else if (key === "beginTime") {
            cronBO[key] = isValid ? Moment(cronBO[key], "HH:mm") as any : null;
          }
        } else if (cronType === PeriodType.hour) {
          if (key === "endTime") {
            cronBO[key] = isValid?Moment(cronBO[key], "HH:mm").minute(59) as any :null;
          } 
        }
      }

      return {
        value: cronBO[key],
        onChange: value => {
          cronBO[key] = value;
          // 数据订正
          const isValid = Moment(cronBO[key]).isValid();
          if(isValid) {
            if (cronType === PeriodType.minute) {
              if (key === "endTime") {
                cronBO[key] = isValid ? Moment(cronBO[key], "HH:mm") as any : null;
              } else if (key === "beginTime") {
                cronBO[key] = isValid ? Moment(cronBO[key], "HH:mm") as any : null;
              }
            } else if (cronType === PeriodType.hour) {
              if (key === "endTime") {
                cronBO[key] = isValid ? Moment(cronBO[key], "HH:mm").minute(59) as any :null;
              } 
            }
          }
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

        return (
          <TimePicker
            disabledHours={disabledHours}
            format='HH:mm'
            {...getCommonProps(cron, "time")}
            disabled={disabled}
          />
        );
      }

      case PeriodType.week: {
        return (
          <span>
            <span className="cron-select-wrapper">
              <Select
                className={this.state.isError ? "cron-select-error" :"cron-select"}
                disabled={disabled}
                mode={multiple ? 'tags' : 'default'}
                style={{ width: 200, borde: '1px solid red' }}
                {...getCommonProps(cron, "weeks")}
                onChange={(value: string[]) => {
                  const weeks = multiple ? value.sort((a, b) => +a - +b) : [].concat(value);
                  cron.weeks = weeks
                  this.triggerChange();
                }}
                value={cron.weeks.filter(item => item !== '*')}
              >
                {getOptions(getWeekItems(lang, dayOfWeek))}
              </Select>
              {this.state.isError && this.props.errorMessage && <div className="cron-select-errorMessage">{this.props.errorMessage}</div>}
            </span> 
            
            <TimePicker
              disabledHours={disabledHours}
              format='HH:mm'
              {...getCommonProps(cron, "time")}
            />
          </span>
        );
      }

      case PeriodType.month: {
        return (
          <span>
            <span className="cron-select-wrapper">
              <Select
                className={this.state.isError ? "cron-select-error" :"cron-select"}
                disabled={disabled}
                mode={multiple ? 'tags' : 'default'}
                style={{ width: 200 }}
                {...getCommonProps(cron, "days")}
                onChange={(value: string[]) => {
                  const days = multiple ? value.sort((a, b) => +a - +b) : [].concat(value);
                  cron.days = days
                  this.triggerChange();
                }}
                value={cron.days}
              >
                {getOptions(getDayItems(lang))}
              </Select>
              {this.state.isError && this.props.errorMessage && <div className="cron-select-errorMessage">{this.props.errorMessage}</div>}
            </span>
            <TimePicker
              disabledHours={disabledHours}
              format='HH:mm'
              {...getCommonProps(cron, "time")}
            />
          </span>
        );
      }

      case PeriodType.minute: {
        const startTime = +Moment(
          getCommonProps(cron, "beginTime").value
        ).format("HH");
        const endTime = +Moment(getCommonProps(cron, "endTime").value).format(
          "HH"
        );
        return (
          <span>
            <span className='form-item'>
              <span className='form-item-title'>{I18N.start}</span>
              <TimePicker
                disabled={disabled}
                disabledHours={this.disabledHours.bind(
                  this,
                  startTime,
                  endTime,
                  "end"
                )}
                // disabledMinutes={() => getArr(59, 1)}
                format='HH:mm'
                onOpenChange={this.handleStartOpenChange}
                {...getCommonProps(cron, "beginTime", PeriodType.minute)}
              />
            </span>
            <span className='form-item'>
              <span className='form-item-title'>{I18N.step}</span>
              <Select
                disabled={disabled}
                style={{ width: 100 }}
                {...getCommonProps(cron, "stepMinute")}
              >
                {getOptions(getStepMinuteItems)}
              </Select>
              <span style={{ marginRight: 20 }}>{I18N.stepMinuteUnit}</span>
            </span>
            <span className='form-item'>
              <span className='form-item-title'>{I18N.end}</span>
              <TimePicker
                disabled={disabled}
                format='HH:mm'
                {...getCommonProps(cron, "endTime", PeriodType.minute)}
                disabledHours={this.disabledHours.bind(
                  this,
                  startTime,
                  endTime,
                  "start"
                )}
                // disabledMinutes={() => getArr(59, 0)}
                open={endOpen}
                onOpenChange={this.handleEndOpenChange}
              />
            </span>
          </span>
        );
      }

      case PeriodType.hour: {
        const startTime = +Moment(
          getCommonProps(cron, "beginTime").value
        ).format("HH");
        const endTime = +Moment(getCommonProps(cron, "endTime").value).format(
          "HH"
        );

        return (
          <span>
            <RadioGroup
              disabled={disabled}
              value={cron.hasInterval ? "step" : "point"}
              onChange={e => {
                cron.hasInterval = e.target.value === "step";
                this.triggerChange();
              }}
            >
              <Radio value='step'>{I18N.period}</Radio>
              <Radio value='point'>{I18N.point}</Radio>
            </RadioGroup>
            {cron.hasInterval ? (
              <span>
                <span className='form-item'>
                  <span className='form-item-title'>{I18N.start}</span>
                  <TimePicker
                    disabled={disabled}
                    disabledHours={this.disabledHours.bind(
                      this,
                      startTime,
                      endTime,
                      "end"
                    )}
                    onOpenChange={this.handleStartOpenChange}
                    format='HH:mm'
                    {...getCommonProps(cron, "beginTime", PeriodType.hour)}
                  />
                </span>
                <span className='form-item'>
                  <span className='form-item-title'>{I18N.step}</span>
                  <Select
                    disabled={disabled}
                    style={{ width: 100 }}
                    {...getCommonProps(cron, "stepHour")}
                  >
                    {getOptions(getSteoHourItems)}
                  </Select>
                  <span style={{ marginRight: 20 }}>{I18N.stepHourUnit}</span>
                </span>
                <span className='form-item'>
                  <span className='form-item-title'>{I18N.end}</span>
                  <TimePicker
                    disabled={disabled}
                    format='HH:mm'
                    disabledHours={this.disabledHours.bind(
                      this,
                      startTime,
                      endTime,
                      "start"
                    )}
                    disabledMinutes={() => getArr(59, 0)}
                    open={endOpen}
                    onOpenChange={this.handleEndOpenChange}
                    {...getCommonProps(cron, "endTime", PeriodType.hour)}
                  />
                </span>
              </span>
            ) : (
              <span className="cron-select-wrapper">

              <Select
                className={this.state.isError ? "cron-select-error" :"cron-select"}
                mode={multiple ? 'tags' : 'default'}
                disabled={disabled}
                style={{ width: 200 }}
                onChange={(value: string[]) => {
                  const hours = multiple ? value.sort((a, b) => +a - +b) : [].concat(value);
                  cron.hours = hours
                  this.triggerChange();
                 
                }}
                value={cron.hours}
              >
                {getOptions(getHourItems(lang, beginTime, endTime))}
              </Select>
              {this.state.isError && this.props.errorMessage && <div className="cron-select-errorMessage">{this.props.errorMessage}</div>}
            </span> 
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
    const {
      cronExpression,
      onChange,
      lang,
      showCheckbox,
      disabled,
      showRecentTime,
      options,
      dayOfWeekOneBased,
      strictValidate,
    } = this.props;
    const I18N = getI18N(lang);
    const { cron } = this.state;
    const typeCx = cron.periodType;
    const dayOfWeek = dayOfWeekOneBased === false ? DayOfWeekType.Linux : this.props.dayOfWeek;
    const isValidate = cronValidate(cronExpression, dayOfWeek, strictValidate);
    return (
      <span className={`schedule-period ${typeCx}`}>
        <Select
          value={cron.periodType}
          onChange={this.handleChangePeriodType.bind(this)}
          disabled={disabled}
        >
          {getOptions(getPeriodItems(lang, options))}
        </Select>
        {!!showCheckbox && (
          <Checkbox
            onChange={e => {
              (cron as DayCron).changeIsSchedule(e.target.checked);
              this.triggerChange();
            }}
            disabled={cron.periodType !== PeriodType.day || disabled}
            checked={
              cron.periodType !== PeriodType.day ? true : cron.isSchedule
            }
          >
            <span className='timing'>{I18N.timing}</span>
          </Checkbox>
        )}
        {this.renderDetail()}
        {cronExpression && !isValidate && (
          <span className='errorCronExp'>{I18N.errorCronExp}</span>
        )}
        <span className='exp'>
          <span className='exp-title'>{I18N.expTitle}</span>
          <span className='exp-cron'>{cronExpression}</span>
        </span>
        {showRecentTime && (
          <span className='recent'>
            <span className='recent-title'>{I18N.recentTimes}</span>
            <ul>
              {this.state.timeList.map((time, index) => (
                <li key={index}>{time}</li>
              ))}
            </ul>
          </span>
        )}
      </span>
    );
  }
}

// 提供cron Expression验证方法
export { cronValidate, getPredictedTimes, DayOfWeekType };
