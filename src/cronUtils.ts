import * as Moment from "moment";
import * as _ from "lodash";
import * as React from "react";
import { getI18N, getArr } from "./I18N";

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

export const getPeriodItems = (lang: string) =>
  Object.values(PeriodType).map(item => {
    const I18N = getI18N(lang);
    const TranslateMap = I18N["translateMap"];
    return {
      text: TranslateMap[item],
      value: item
    };
  });

export const getHourItems = (lang: string) => {
  const hourUnit = getI18N(lang).hourUnit;
  return getArr(24).map(num => ({
    text: `${num}${hourUnit}`,
    value: String(num)
  }));
};

export const getDayItems = (lang: string) => {
  const dayItemsList = getI18N(lang).dayItemsList;
  return dayItemsList.map(num => {
    return {
      text: `${num}`,
      value: String(num.replace(/[^0-9]/gi, ""))
    };
  });
};

export const getWeekItems = (lang: string) => {
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

    return `0 ${time.minutes()} ${time.hours()} ${days.join(",")} * ?`;
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

    return `0 ${time.minutes()} ${time.hours()} ? * ${weeks.join(",")}`;
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
  endTime? = Moment("00:00", "HH:mm");
  stepHour? = "1";

  format() {
    const { hasInterval, beginTime, endTime, hours, stepHour } = this;

    if (hasInterval) {
      return `0 ${beginTime.minutes()} ${beginTime.hours()}-${endTime.hours()}/${stepHour} * * ?`;
    } else {
      return `0 0 ${hours.join(",")} * * ?`;
    }
  }

  constructor(cron: Partial<HourCron>) {
    super();
    this.init(cron);
  }
}

class MinuteCron extends Cron {
  readonly periodType = PeriodType.minute;

  beginTime? = Moment("00:00", "HH:mm");
  endTime? = Moment("00:00", "HH:mm");
  stepMinute? = "05";

  format() {
    const { beginTime, endTime, stepMinute } = this;

    return `0 ${beginTime.minutes()}/${stepMinute} ${beginTime.hours()}-${endTime.hours()} * * ?`;
  }

  constructor(cron: Partial<MinuteCron>) {
    super();
    this.init(cron);
  }
}
