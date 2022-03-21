import * as Moment from "moment";
import * as _ from "lodash";
import { getI18N, getArr, LangEnum } from "./I18N";
import { cronValidate } from "./cronExpValidator";

export function isStrNum(str: string) {
  return !Number.isNaN(Number(str));
}

/** 不同语言对于周调度的取值不同 */
export const enum DayOfWeekType {
  // 周日到周六对应 0-6 
  Linux = 'Linux',
  // 周一到周日对应 1-7
  Spring = 'Spring',
  // 周日到周六对应 1-7
  Quartz = 'Quartz',
}

/** 新增对外报漏方法： 由表达式获取最近时间 */
interface typeCornProps {
  /** 表达式 */
  corn: string;
  /** T+n */
  delay?:number;
  /** day of week是否从1开始。如果为true时，周日至周六对应1~7；否则从0开始，周日至周六对应0~6 */
  dayOfWeekOneBased?:boolean;
  /**
   * 是否严格校验cron表达式。如果为true，cron表达式的day of week字段必须是严格递增的, 
   * 例如day of week是'5,6'，则是合法的。但如果是'6,5'，则校验不通过
   */
  strictValidate?:boolean;
  /**
   * 展示最近生成时间的数量
   */
  recentTimeNum?:number;
  /** 按哪种语言来处理周调度 */
  dayOfWeek?: DayOfWeekType;
}

export function getPredictedTimes (props: typeCornProps): string[] {
  const { corn, dayOfWeekOneBased = true,  strictValidate = true, recentTimeNum = 5, delay = 1, dayOfWeek = DayOfWeekType.Quartz}  = props;
  const dayOfWeekType = dayOfWeekOneBased === false ? DayOfWeekType.Linux : dayOfWeek;
  const cron = Cron.getCronFromExp(corn, dayOfWeekType, strictValidate);
  cron.delay = delay;
  return cron.getPredictedTimes(recentTimeNum);
}

export enum PeriodType {
  day = "day",
  week = "week",
  month = "month",
  hour = "hour",
  minute = "minute"
}

// 默认时间格式化形式
export const DEFAULT_FORMAT = "YYYY-MM-DD HH:mm:ss";

export const getPeriodItems = (lang: LangEnum, timeOptions: PeriodType[]) =>
  timeOptions
    .filter(item => Object.values(PeriodType).includes(item))
    .map(item => {
      const I18N = getI18N(lang);
      const TranslateMap = I18N["translateMap"];
      return {
        text: TranslateMap[item],
        value: item
      };
    });

export const getHourItems = (lang: LangEnum, beginTime = 0, endTime = 24) => {
  const hourUnit = getI18N(lang).hourUnit;
  return [...getArr(endTime - beginTime + 1, beginTime)].map(num => ({
    text: `${num}${hourUnit}`,
    value: String(num)
  }));
};

export const getDayItems = (lang: LangEnum) => {
  const dayItemsList = getI18N(lang).dayItemsList;
  return dayItemsList.map(num => {
    return {
      text: `${num}`,
      value: String(num.replace(/[^0-9]/gi, ""))
    };
  });
};

export const getWeekItems = (lang: LangEnum, dayOfWeek = DayOfWeekType.Quartz) => {
  const I18N = getI18N(lang);
  const weekItemsList = I18N["weekItemsList"];
  if (dayOfWeek !== DayOfWeekType.Spring) {
    return weekItemsList.map((day, dayIndex) => {
      return {
        text: day,
        value: dayIndex + (dayOfWeek === DayOfWeekType.Quartz ? 1 : 0) + "",
      };
    });
  }
  return [...weekItemsList.slice(1), weekItemsList[0]].map((day, dayIndex) => {
    return {
      text: day,
      value: `${dayIndex + 1}`,
    };
  });
};

export const getSteoHourItems = getArr(12, 1).map(num => {
  return {
    text: num + "",
    value: num + ""
  };
});

export const getStepMinuteItems = [
  5,
  10,
  15,
  20,
  25,
  30,
  35,
  40,
  45,
  50,
  55
].map(num => {
  const str = String(num + 100).slice(1);
  return {
    text: str,
    value: str
  };
});

/** 计算对应多少分钟 */
export const getMins = (time: Moment.Moment): number => {
  const seconds = Moment(time).minute() + Moment(time).hour() * 60;
  return seconds;
};

export type AllCron = DayCron | WeekCron | MonthCron | HourCron | MinuteCron;

type timeMoment = {
  start?: Moment.Moment,
  end?: Moment.Moment
}

interface CronInterface {
  /**
   * 根据当前时间或者delay重置，开始和结束时间，子类会继承重写此方法
   * 目的： 修改bug #33456510
   */
  resetStartAndEndTime(): timeMoment
}

export class Cron implements CronInterface{
  periodType: PeriodType;

  /**
   * T+n，定时任务开始时间为n天/n月/n年后，默认为1
   * 若传值为0，那么就取大于当前时间的最新周期
   */
  delay: number = 1;

  resetStartAndEndTime() {
    return {}
  }

  init(cron: any) {
    _.forEach(cron, (value, key) => {
      if (value !== "periodType") {
        this[key] = value;
      }
    });
  }

  static getCronFromPeriodType(periodType: PeriodType, dayOfWeek = DayOfWeekType.Quartz) {
    if (periodType === PeriodType.day) {
      return new DayCron({});
    } else if (periodType === PeriodType.week) {
      return new WeekCron({ dayOfWeek });
    } else if (periodType === PeriodType.month) {
      return new MonthCron({});
    } else if (periodType === PeriodType.hour) {
      return new HourCron({});
    } else if (periodType === PeriodType.minute) {
      return new MinuteCron({});
    } else if (periodType === PeriodType.hour) {
      return new HourCron({});
    }
  }

  static getCronFromExp(cronExp: string, dayOfWeek = DayOfWeekType.Quartz, strictValidate = true) {
    if (!cronExp) {
      return new DayCron({});
    }
    // 验证cronExp正确性
    if (!cronValidate(cronExp, dayOfWeek, strictValidate)) {
      return new DayCron({});
    }

    const [second, minute = "", hour = "", day, month, week] = cronExp.split(
      " "
    );
    if (
      day === "*" &&
      !minute.includes("/") &&
      !hour.includes(",") &&
      !hour.includes("/")
    ) {
      return new DayCron({
        time: Moment(`${hour}:${minute}`, "HH:mm"),
        isSchedule: hour !== "0" || minute !== "0"
      });
    } else if (day === "?") {
      return new WeekCron({
        time: Moment(`${hour}:${minute}`, "HH:mm"),
        weeks: week.split(","),
        dayOfWeek
      });
    } else if (day !== "*" && isStrNum(hour)) {
      // 每月多少号
      return new MonthCron({
        days: day.split(","),
        time: Moment(`${hour}:${minute}`, "HH:mm")
      });
    } else if (minute.includes("/")) {
      const [beginMinute, stepMinute] = minute.split("/");
      const [beginHour, endHour] = hour.split("-");

      return new MinuteCron({
        beginTime: Moment(`${beginHour}:${beginMinute}`, "HH:mm"),
        endTime: Moment(`${endHour}:59`, "HH:mm"),
        stepMinute
      });
    } else {
      if (hour.includes(",")) {
        // 时间点
        return new HourCron({
          hours: hour.split(","),
          hasInterval: false
        });
      } else if (hour.includes("/")) {
        // 时间段
        const [duration, stepHour] = hour.split("/");
        const [beginHour, endHour] = duration.split("-");

        return new HourCron({
          beginTime: Moment(`${beginHour}:${minute}`, "HH:mm"),
          endTime: Moment(`${endHour}:00`, "HH:mm"),
          stepHour,
          hasInterval: true // 有时间段，默认为true
        });
      } else {
        return new HourCron({ hours: [] });
      }
    }
  }
}

export class DayCron extends Cron {
  readonly periodType = PeriodType.day;

  time = Moment("00:00", "HH:mm");
  isSchedule = false;

  changeIsSchedule(isSchedule: boolean) {
    if (this.isSchedule && !isSchedule) {
      this.time = Moment("00:00", "HH:mm");
    }

    this.isSchedule = isSchedule;
  }

  /** 产生预测时间-Day */
  getPredictedTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const { time, delay } = this;
    const now = Moment().add(delay >= 1 ? delay : 0, 'd');
    // isBefore表示当前时间之前是否是设置时间之前
    // 若之前，则直接从第二天计算开始，否则从当天时间开始
    const isBefore = now.isBefore(time);
    const step = delay >= 1 ? delay : (isBefore ? 0 : 1);
    const predictedTimes = time ? getArr(times).map(
      (current, index) =>
        `${Moment(time)
          .add(index + step, "days")
          .format(format)}`
    ): [];

    return predictedTimes;
  }

  format() {
    const time = this.time;
    if(!Moment(time).isValid()) {
      return;
    }
    return `0 ${time.minutes()} ${time.hours()} * * ?`;
  }

  constructor(cron: Partial<DayCron>) {
    super();
    this.init(cron);
  }
}

class MonthCron extends Cron {
  readonly periodType = PeriodType.month;

  days = [] as string[];
  time = Moment("00:00", "HH:mm");

  format() {
    const { days, time } = this;
    if(Moment(time).isValid() && days){
      return `0 ${time.minutes()} ${time.hours()} ${
        days.length > 0 ? days.join(",") : "*"
      } * ?`;
    }else {
      return;
    }
  }

  /**
   * 计算带明确日期的有效时间，若入参拼接得到的时间有效，则返回拼接的时间，否则返回下一个月的日期
   * 譬如 monthWithYear = Moment('2022-02'), day = '29', 返回 '2022-03-29';
   */
  getValidNextDateWithMonth(monthWithYear: Moment.Moment, day: string, format = DEFAULT_FORMAT) {
    const [year, month] =  Moment(monthWithYear).format("YYYY-MM").split('-');
    const dayInNextMonth = Moment(`${year}-${month}-${day}`);
    if (dayInNextMonth.isValid()) {
     return dayInNextMonth.format(format);
    }
    // 12月有31天，该月所有日期是有效的，因此这里可以直接 month + 1 
    return  Moment(`${year}-${+month + 1}-${day}`).format(format);
  }

  // 计算预测时间
  generatePredicteTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const { days, time, delay } = this;
    const sortedDays = days.sort((a, b) => +a - +b);
    const now = Moment().add(delay >= 1 ? delay : 0, 'd');
    const currentDay = +Moment().format("DD");
    const sortedIndex = _.sortedIndex(sortedDays, currentDay);
    const predictedTimes = [
      ..._.sortedUniq(sortedDays.slice(sortedIndex)),
      ..._.sortedUniq(sortedDays.slice(0, sortedIndex))
    ]
      .slice(0, times)
      .map(selectedDay => {
        const diff = +selectedDay - currentDay;
        // 为当天时，则比较具体的时间
        if (diff === 0) {
          const isBefore = now.isBefore(time);
          return this.getValidNextDateWithMonth(Moment(time).add(isBefore ? 0 : 1, "months"), selectedDay);
        } else {
          return this.getValidNextDateWithMonth(Moment(time).add(diff >= 0 ? 0 : 1, "months"), selectedDay);
        }
      })
      .sort((a, b) => {
        return +Moment(a).format("YYYYMMDD") - +Moment(b).format("YYYYMMDD");
      });

    return predictedTimes;
  }

  /** 产生预测时间-Month */
  getPredictedTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const { days, time } = this;

    let predictedTimes = [];
    if (days && days.length > 0) {
      if (days.length > times) {
        predictedTimes = this.generatePredicteTimes(times, format);
      } else {
        predictedTimes = this.generatePredicteTimes(times, format);
        const list = [...predictedTimes];
        // 每一个月的XX号都执行
        getArr(times - days.length).forEach((item, index) => {
          list.forEach(predictedTime => {
            const day = Moment(predictedTime).format("DD");
            let time = this.getValidNextDateWithMonth(Moment(predictedTime).add(index + 1, "months"), day);
            while(predictedTimes.includes(time)) {
              time =  this.getValidNextDateWithMonth(Moment(time).add(1, "months"), day);
            }
            predictedTimes.push(time);
          });
        });
      }
    }
    return predictedTimes.sort((a, b) => {
      return +Moment(a).format("YYYYMMDD") - +Moment(b).format("YYYYMMDD");
    }).slice(0, times);
  }

  constructor(cron: Partial<MonthCron>) {
    super();
    this.init(cron);
  }
}

class WeekCron extends Cron {
  readonly periodType = PeriodType.week;

  weeks = [] as string[];
  time = Moment("00:00", "HH:mm");
  // day of week是否从1开始。如果为true时，周日至周六对应1~7；否则从0开始，周日至周六对应0~6
  // dayOfWeekOneBased = true;
  dayOfWeek = DayOfWeekType.Quartz;
  format() {
    const { weeks, time } = this;
    if(Moment(time).isValid() && weeks){
      return `0 ${time.minutes()} ${time.hours()} ? * ${
        weeks.length > 0 ? weeks.join(",") : "*"
      }`;
    }else {
      return;
    }
  }

  generatePredictedTime(times = 5, format = DEFAULT_FORMAT): string[] {
    const { weeks, time, dayOfWeek, delay } = this;
    const now = Moment();
    // Moment 中周一到周日对应 1-7，相当于是 DayOfWeekType.Spring 的对应关系
    let curretWeek = +now.format("E");
    if (dayOfWeek === DayOfWeekType.Quartz) {
      curretWeek = curretWeek === 7 ? 1 : curretWeek + 1;
    } else if (dayOfWeek === DayOfWeekType.Linux) {
      curretWeek = curretWeek === 7 ? 0 : curretWeek;
    }
    // 找到若插入sortedDays中的索引
    const sortedIndex = _.sortedIndex(weeks, +curretWeek);
    const predictedTimes = [
      ..._.sortedUniq(weeks.slice(sortedIndex)),
      ..._.sortedUniq(weeks.slice(0, sortedIndex))
    ]
      .slice(0, times)
      .map(dayStr => {
        const day = Number(dayStr);
        let diff = day - curretWeek;
          if (diff < 0) {
            diff = diff + 7;
          }
        if (diff === 0) {
          const isBefore = Moment().isBefore(time);
          const delayStep = delay >= 1 ? delay : (isBefore ? 0 : 1);
          return Moment(time)
            .add(delayStep, "weeks")
            .format(format);
        } else {
          return Moment(time)
            .add(diff >= 0 ? 0 : 1, "weeks")
            .add(`${diff}`, "days")
            .format(format);
        }
      })
      .sort((a, b) => {
        return +Moment(a).format("YYYYMMDD") - +Moment(b).format("YYYYMMDD");
      });
    return predictedTimes;
  }

  /** 产生预测时间-Week */
  getPredictedTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const { weeks, time } = this;
    let predictedTimes = [];

    if (weeks && weeks.length > 0) {
      if (weeks.length >= times) {
        predictedTimes = this.generatePredictedTime(times, format);
      } else {
        predictedTimes = this.generatePredictedTime(times, format);
        const list = [...predictedTimes];

        getArr(times - weeks.length).forEach((item, index) => {
          list.forEach(predictedTime => {
            if (predictedTimes.length < times) {
              predictedTimes.push(
                Moment(predictedTime)
                  .add((index + 1) * 7, "days")
                  .format(format)
              );
            }
          });
        });
      }
    }
    return predictedTimes;
  }

  constructor(cron: Partial<WeekCron>) {
    super();
    this.init(cron);
  }
}

export class HourCron extends Cron {
  readonly periodType = PeriodType.hour;

  /** 是否使用时间段 */
  hasInterval = false;
  hours? = [] as string[];
  beginTime? = Moment("00:00", "HH:mm");
  // endTime minutes only 59
  endTime? = Moment("23:59", "HH:mm");
  stepHour? = "1";

  format() {
    const { hasInterval, beginTime, endTime, hours, stepHour } = this;
    const isValid = Moment(beginTime).isValid() && Moment(endTime).isValid();

    if(isValid) {
      if (hasInterval) {
        return `0 ${beginTime.minutes()} ${beginTime.hours()}-${endTime.hours()}/${stepHour} * * ?`;
      } else {
        return `0 0 ${hours.length > 0 ? hours.join(",") : "*"} * * ?`;
      }
    }else {
      return;
    }
  }

  resetStartAndEndTime(): {
    start: Moment.Moment,
    end: Moment.Moment
  } {
    let { beginTime, endTime, stepHour } = this;
    let start = Moment(beginTime)
    let end = Moment(endTime);
    let now = Moment();

    if (this.delay >= 1) {
      start = start.add(this.delay, 'd')
      end = end.add(this.delay, 'd');
    } else {
      /* 第一步：判断当前时间 是否 大于 开始时间和结束时间 */
      let isGtStart = now.isAfter(start)
      let isGtEnd = now.isAfter(end)
      /* 当前选择时间在开始和结束时间的 右边 */
      if (isGtStart && isGtEnd) {
        start = start.add(1, 'd');
        end = end.add(1, 'd')
      } else if (isGtStart && !isGtEnd) {
        /* 当前选择时间在开始和结束时间的中间 */
        stepHour = !parseInt(stepHour) ? '1' : stepHour;
        const total = Math.ceil(Number(getMins(start) / 60)) + Number(stepHour)
        stepHour = total >= 12 ? '12' : stepHour
        /** 计算开始时间距离当前时间最近一个点的小时数 */
        let dh = (Number(getMins(now)) - Number(getMins(start))) / 60
        let diff = Math.ceil(dh / +stepHour);
        start = start.add(Math.abs(diff * +stepHour), 'h');
      }
    }
    return {
      start, end
    }
  }

  checkTimes(): Moment.Moment[] {
    let { hours, delay } = this;
    let nowHour = Math.ceil(getMins(Moment()) / 60);
    let newHours = hours.map(item => {
      if (delay >= 1) {
        return Moment(item, 'HH').add(delay, 'd')
      } else if (+item < nowHour) {
        return Moment(item, 'HH').add(1, 'd')
      }
      return Moment(item, 'HH')
    }).sort((a: Moment.Moment, b: Moment.Moment) => a.isAfter(b) ? 1 : -1);
    return newHours
  }

  /** 产生预测时间-Hour */
  getPredictedTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const { hasInterval, beginTime, endTime, hours, stepHour } = this;
    let predictedTimes = [];
    // 判断开始/结束时间是否有效
    const isValid = Moment(beginTime).isValid() && Moment(endTime).isValid();
    if (hasInterval) {
      if(isValid) {
        const {start, end} = this.resetStartAndEndTime();
        const minDiff = getMins(end) - getMins(start);
        if (minDiff <= +stepHour * 60) {
          predictedTimes = [Moment(start).format(format)];
        } else {
          // 结束时间减去开始时间/间隔，然后slice(0,times)
          const count = Math.ceil(minDiff / (+stepHour * 60));
          predictedTimes = typeof count === 'number' && getArr(count)
            .slice(0, times)
            .map(
              (item, index) =>
                `${Moment(start)
                  .add(+stepHour * index, "hours")
                  .format(format)}`
            );
        }
      }
    } else {
      predictedTimes = this.checkTimes().slice(0, times).map(item => `${item.format(format)}`);
    }

    return predictedTimes;
  }

  constructor(cron: Partial<HourCron>) {
    super();
    this.init(cron);
  }
}

class MinuteCron extends Cron {
  readonly periodType = PeriodType.minute;

  beginTime? = Moment("00:00", "HH:mm");
  endTime? = Moment("23:59", "HH:mm");
  stepMinute? = "05";

  /** 修正开始和结束时间 */
  resetStartAndEndTime(): {
    start: Moment.Moment
    end: Moment.Moment
  } {
    let { beginTime, endTime, stepMinute } = this;
    let start = Moment(beginTime);
    let end = Moment(endTime);
    let now = Moment();
    if (this.delay >= 1) {
      start = start.add(this.delay, 'd');
      end = end.add(this.delay, 'd');
    } else {
      /* 第一步：判断当前时间 是否 大于 开始时间和结束时间 */
      let isGtStart = now.isAfter(start)
      let isGtEnd = now.isAfter(end)
      /* 当前选择时间在开始和结束时间的 右边 */
      if (isGtStart && isGtEnd) {
        /* 将当前时间+1天返回 */
        start = start.add(1, 'd');
        end = end.add(1, 'd');
      } else if (isGtStart && !isGtEnd) {
        /* 当前选择时间在开始和结束时间的中间 */
        stepMinute = !parseInt(stepMinute) ? '05' : stepMinute;
        const total = Number(beginTime.minutes()) + Number(stepMinute)
        stepMinute = total >= 60 ? '60' : stepMinute
        let diff = Math.ceil((Number(getMins(now)) - Number(getMins(start))) / +stepMinute);
        start = start.add(Math.abs(diff * +stepMinute), 'minute');
      }
    }
    return {
      start, end
    }
  }

  /** 产生预测时间-Min */
  getPredictedTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const { beginTime, endTime, stepMinute } = this;
    let predictedTimes = [];
    const isValid = Moment(beginTime).isValid() && Moment(endTime).isValid();
    if (isValid) {
      const {start,end} = this.resetStartAndEndTime();
      const timeDiff = getMins(end) - getMins(start);
      if (timeDiff <= +stepMinute) {
        // 判断开始结束时间是否大于间隔时间，否则返回开始时间
        predictedTimes = [Moment(start).format(format)];
      } else {
        // 结束时间减去开始时间/间隔，然后slice(0,times)
        const count = Math.ceil(timeDiff / +stepMinute);
        //  30/30 是从30分开始每隔30分执行一次, 超过60分钟，则跳过
        //  0/30 是从0分钟开始每隔30分钟执行一次, 所以就是每个小时的0分, 30分执行
        const total = Number(start.minutes())+ Number(stepMinute)
        const step = total >= 60 ? 60 : stepMinute
        predictedTimes = getArr(count)
        .map((item, index) => {
           // 计算60分钟内的循环次数
           const iter = Math.ceil(60 / Number(step));
           // 新增小时
           const hour = item < iter ?0:Math.floor(item / iter);
           
           const addTime = Number(step) * (index % iter) + 60 * hour;

          return `${Moment(start)
            .add(addTime, "minutes")
            .format(format)}`;
        }).filter(Boolean).slice(0, times);
      }
    }

    return predictedTimes;
  }

  format() {
    const { beginTime, endTime, stepMinute } = this;

    const isValid = Moment(beginTime).isValid() && Moment(endTime).isValid();
    if(isValid) {
      return `0 ${beginTime.minutes()}/${stepMinute} ${beginTime.hours()}-${endTime.hours()} * * ?`;
    }else {
      return;
    }
  }

  constructor(cron: Partial<MinuteCron>) {
    super();
    this.init(cron);
  }
}
