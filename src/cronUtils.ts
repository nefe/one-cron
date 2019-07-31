import * as Moment from "moment";
import * as _ from "lodash";
import * as React from "react";
import { getI18N, getArr, LangEnum } from "./I18N";
import { cronValidate } from "./cronExpValidator";
import moment = require("moment");

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

export const getWeekItems = (lang: LangEnum) => {
  const I18N = getI18N(lang);
  const weekItemsList = I18N["weekItemsList"];
  return weekItemsList.map((day, dayIndex) => {
    return {
      text: day,
      value: dayIndex + 1 + ""
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

export class Cron {
  periodType: PeriodType;

  init(cron: any) {
    _.forEach(cron, (value, key) => {
      if (value !== "periodType") {
        this[key] = value;
      }
    });
  }

  static getCronFromPeriodType(periodType: PeriodType) {
    if (periodType === PeriodType.day) {
      return new DayCron({});
    } else if (periodType === PeriodType.week) {
      return new WeekCron({});
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

  static getCronFromExp(cronExp: string) {
    if (!cronExp) {
      return new DayCron({});
    }
    // 验证cronExp正确性
    if (!cronValidate(cronExp)) {
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
        weeks: week.split(",")
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
        const [beginHour, endHour] = hour.split("-");

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
    const time = this.time;
    const now = Moment();
    // isBefore表示当前时间之前是否是设置时间之前
    // 若之前，则直接从第二天计算开始，否则从当天时间开始
    const isBefore = now.isBefore(time);
    const predictedTimes = getArr(times).map(
      (current, index) =>
        `${Moment(time)
          .add(isBefore ? index : index + 1, "days")
          .format(format)}`
    );

    return predictedTimes;
  }

  format() {
    const time = this.time;

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

    return `0 ${time.minutes()} ${time.hours()} ${
      days.length > 0 ? days.join(",") : "*"
    } * ?`;
  }

  // 计算预测时间
  generatePredicteTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const { days, time } = this;
    const sortedDays = days.sort((a, b) => +a - +b);
    const now = Moment();
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

  format() {
    const { weeks, time } = this;
    return `0 ${time.minutes()} ${time.hours()} ? * ${
      weeks.length > 0 ? weeks.join(",") : "*"
    }`;
  }

  generatePredictedTime(times = 5, format = DEFAULT_FORMAT): string[] {
    const { weeks, time } = this;
    const curretWeek = +Moment().format("E") === 7 ? 0 : +Moment().format("E");
    // 找到若插入sortedDays中的索引
    const sortedIndex = _.sortedIndex(weeks, +curretWeek);
    const predictedTimes = [
      ..._.sortedUniq(weeks.slice(sortedIndex)),
      ..._.sortedUniq(weeks.slice(0, sortedIndex))
    ]
      .slice(0, times)
      .map((child, index) => {
        // child为1时表示为周日
        const diff = child === 1 ? 7 - curretWeek : child - curretWeek - 1;
        if (diff === 0) {
          const isBefore = Moment().isBefore(time);
          return Moment(time)
            .add(isBefore ? 0 : 1, "weeks")
            .format(format);
        } else {
          return Moment(time)
            .add(diff >= 0 ? 0 : 1, "weeks")
            .add(`${Math.abs(diff)}`, "days")
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
  hours? = [] as string[];
  beginTime? = Moment("00:00", "HH:mm");
  // endTime minutes only 59
  endTime? = Moment("23:59", "HH:mm");
  stepHour? = "1";

  format() {
    const { hasInterval, beginTime, endTime, hours, stepHour } = this;
    if (hasInterval) {
      return `0 ${beginTime.minutes()} ${beginTime.hours()}-${endTime.hours()}/${stepHour} * * ?`;
    } else {
      return `0 0 ${hours.length > 0 ? hours.join(",") : "*"} * * ?`;
    }
  }

  /** 产生预测时间-Hour */
  getPredictedTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const { hasInterval, beginTime, endTime, hours, stepHour } = this;
    let predictedTimes = [];

    if (hasInterval) {
      const minDiff = getMins(endTime) - getMins(beginTime);
      if (minDiff <= +stepHour * 60) {
        predictedTimes = [Moment(beginTime).format(format)];
      } else {
        // 结束时间减去开始时间/间隔，然后slice(0,times)
        const count = minDiff / (+stepHour * 60);
        predictedTimes = getArr(count)
          .slice(0, times)
          .map(
            (item, index) =>
              `${Moment(beginTime)
                .add(+stepHour * index, "hours")
                .format(format)}`
          );
      }
    } else {
      predictedTimes = hours
        .slice(0, times)
        .map(hour => `${moment(hour, "HH").format(format)}`);
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

  /** 产生预测时间-Min */
  getPredictedTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const { beginTime, endTime, stepMinute } = this;
    let predictedTimes = [];
    const timeDiff = getMins(endTime) - getMins(beginTime);
    if (timeDiff <= +stepMinute) {
      // 判断开始结束时间是否大于间隔时间，否则返回开始时间
      predictedTimes = [Moment(beginTime).format(format)];
    } else {
      // 结束时间减去开始时间/间隔，然后slice(0,times)
      const count = timeDiff / +stepMinute;
      predictedTimes = getArr(count)
        .slice(0, times)
        .map(
          (item, index) =>
            `${Moment(beginTime)
              .add(+stepMinute * index, "minutes")
              .format(format)}`
        );
    }
    return predictedTimes;
  }

  format() {
    const { beginTime, endTime, stepMinute } = this;

    return `0 */${stepMinute} ${beginTime.hours()}-${endTime.hours()} * * ?`;
  }

  constructor(cron: Partial<MinuteCron>) {
    super();
    this.init(cron);
  }
}
