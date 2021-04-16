import * as Moment from "moment";
import * as _ from "lodash";
import { getI18N, getArr, LangEnum } from "./I18N";
import { cronValidate } from "./cronExpValidator";

export function isStrNum(str: string) {
  return !Number.isNaN(Number(str));
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

export const getWeekItems = (lang: LangEnum, dayOfWeekOneBased: boolean = true) => {
  const I18N = getI18N(lang);
  const weekItemsList = I18N["weekItemsList"];
  return weekItemsList.map((day, dayIndex) => {
    return {
      text: day,
      value: dayIndex + (dayOfWeekOneBased ? 1 : 0) + "",
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
export class Cron implements CronInterface {
  periodType: PeriodType;
  /**
   * T+n，定时任务开始时间为n天/n月/n年后，默认为1
   * 若传值为0，那么就取大于当前时间的最新周期
   */
  delay: number = 1;

  init(cron: any) {
    _.forEach(cron, (value, key) => {
      if (value !== "periodType") {
        this[key] = value;
      }
    });
  }

  resetStartAndEndTime() {
    return {}
  }

  static getCronFromPeriodType(periodType: PeriodType, dayOfWeekOneBased: boolean = true) {
    if (periodType === PeriodType.day) {
      return new DayCron({});
    } else if (periodType === PeriodType.week) {
      return new WeekCron({ dayOfWeekOneBased });
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

  static getCronFromExp(cronExp: string, dayOfWeekOneBased = true, strictValidate = true) {
    if (!cronExp) {
      return new DayCron({});
    }
    // 验证cronExp正确性
    if (!cronValidate(cronExp, dayOfWeekOneBased, strictValidate)) {
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
        dayOfWeekOneBased
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
        endTime: Moment(`${endHour}:00`, "HH:mm"),
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
    const predictedTimes = time ? getArr(times).map(
      (current, index) =>
        `${Moment(time)
          .add(isBefore ? index : index + 1, "days")
          .format(format)}`
    ) : [];

    return predictedTimes;
  }

  format() {
    const time = this.time;
    if (!Moment(time).isValid()) {
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
    if (Moment(time).isValid() && days) {
      return `0 ${time.minutes()} ${time.hours()} ${days.length > 0 ? days.join(",") : "*"
        } * ?`;
    } else {
      return;
    }
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
          return Moment(time)
            .add(isBefore ? 0 : 1, "months")
            .format(format);
        } else {
          return Moment(time)
            .add(diff >= 0 ? 0 : 1, "months")
            .add(`${diff}`, "days")
            .format(format);
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
            if (predictedTimes.length < times) {
              predictedTimes.push(
                Moment(predictedTime)
                  .add(index + 1, "months")
                  .format(format)
              );
            }
          });
        });
      }
    }
    return predictedTimes;
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
  dayOfWeekOneBased = true;

  format() {
    const { weeks, time } = this;
    if (Moment(time).isValid() && weeks) {
      return `0 ${time.minutes()} ${time.hours()} ? * ${weeks.length > 0 ? weeks.join(",") : "*"
        }`;
    } else {
      return;
    }
  }

  generatePredictedTime(times = 5, format = DEFAULT_FORMAT): string[] {
    const { weeks, time, dayOfWeekOneBased, delay } = this;
    const now = Moment().add(delay >= 1 ? delay : 0, 'd');
    const curretWeek = +now.format("E") === 7 ? 0 : +now.format("E");
    // 找到若插入sortedDays中的索引
    const sortedIndex = _.sortedIndex(weeks, +curretWeek);
    const predictedTimes = [
      ..._.sortedUniq(weeks.slice(sortedIndex)),
      ..._.sortedUniq(weeks.slice(0, sortedIndex))
    ]
      .slice(0, times)
      .map(dayStr => {
        const day = Number(dayStr);
        let diff: number;

        if (dayOfWeekOneBased) {
          // day为1时表示为周日
          diff = day === 1 ? 7 - curretWeek : day - curretWeek - 1;
        } else {
          // day为0时表示周日
          diff = day - curretWeek;
          if (diff < 0) {
            diff = diff + 7;
          }
        }

        if (diff === 0) {
          const isBefore = Moment().isBefore(time);
          return Moment(time)
            .add(isBefore ? 0 : 1, "weeks")
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

class HourCron extends Cron {
  readonly periodType = PeriodType.hour;

  /** 是否使用时间段 */
  hasInterval = false;
  hours?= [] as string[];
  beginTime?= Moment("00:00", "HH:mm");
  // endTime minutes only 59
  endTime?= Moment("23:59", "HH:mm");
  stepHour?= "1";

  format() {
    const { hasInterval, beginTime, endTime, hours, stepHour } = this;
    const isValid = Moment(beginTime).isValid() && Moment(endTime).isValid();

    if (isValid) {
      if (hasInterval) {
        return `0 ${beginTime.minutes()} ${beginTime.hours()}-${endTime.hours()}/${stepHour} * * ?`;
      } else {
        return `0 0 ${hours.length > 0 ? hours.join(",") : "*"} * * ?`;
      }
    } else {
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
      if (isValid) {
        const { start, end } = this.resetStartAndEndTime();
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
      // predictedTimes = hours
      //   .slice(0, times)
      //   .map(hour => `${Moment(hour, "HH").format(format)}`);
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

  beginTime?= Moment("00:00", "HH:mm");
  endTime?= Moment("23:59", "HH:mm");
  stepMinute?= "05";

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
        const total = Number(getMins(start)) + Number(stepMinute)
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
      const { start, end } = this.resetStartAndEndTime();
      const timeDiff = getMins(end) - getMins(start);
      if (timeDiff <= +stepMinute) {
        // 判断开始结束时间是否大于间隔时间，否则返回开始时间
        predictedTimes = [Moment(start).format(format)];
      } else {
        // 结束时间减去开始时间/间隔，然后slice(0,times)
        const count = Math.ceil(timeDiff / +stepMinute);
        //  30/30 是从30分开始每隔30分执行一次, 超过60分钟，则跳过
        //  0/30 是从0分钟开始每隔30分钟执行一次, 所以就是每个小时的0分, 30分执行
        const total = Number(getMins(start)) + Number(stepMinute)
        const step = total >= 60 ? 60 : stepMinute
        predictedTimes = getArr(count)
          .map((item, index) => {
            const addTime = Number(step) * index
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
    if (isValid) {
      return `0 ${beginTime.minutes()}/${stepMinute} ${beginTime.hours()}-${endTime.hours()} * * ?`;
    } else {
      return;
    }
  }

  constructor(cron: Partial<MinuteCron>) {
    super();
    this.init(cron);
  }
}
