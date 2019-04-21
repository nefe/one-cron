import * as Moment from 'moment';
import * as _ from 'lodash';
import * as React from 'react';
import { getI18N, getArr, LangEnum } from './I18N';
import { cronValidate } from './cronExpValidator';
import moment = require('moment');

export function isStrNum(str: string) {
  return !Number.isNaN(Number(str));
}

export enum PeriodType {
  day = 'day',
  week = 'week',
  month = 'month',
  hour = 'hour',
  minute = 'minute'
}
// 默认时间格式化形式
export const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export const getPeriodItems = (lang: LangEnum) =>
  Object.values(PeriodType).map(item => {
    const I18N = getI18N(lang);
    const TranslateMap = I18N['translateMap'];
    return {
      text: TranslateMap[item],
      value: item
    };
  });

export const getHourItems = (lang: LangEnum) => {
  const hourUnit = getI18N(lang).hourUnit;
  return getArr(24).map(num => ({
    text: `${num}${hourUnit}`,
    value: String(num)
  }));
};

export const getDayItems = (lang: LangEnum) => {
  const dayItemsList = getI18N(lang).dayItemsList;
  return dayItemsList.map(num => {
    return {
      text: `${num}`,
      value: String(num.replace(/[^0-9]/gi, ''))
    };
  });
};

export const getWeekItems = (lang: LangEnum) => {
  const I18N = getI18N(lang);
  const weekItemsList = I18N['weekItemsList'];
  return weekItemsList.map((day, dayIndex) => {
    return {
      text: day,
      value: dayIndex + 1 + ''
    };
  });
};

export const getSteoHourItems = getArr(12, 1).map(num => {
  return {
    text: num + '',
    value: num + ''
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
      if (value !== 'periodType') {
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

    const [second, minute = '', hour = '', day, month, week] = cronExp.split(
      ' '
    );

    if (
      day === '*' &&
      !minute.includes('/') &&
      !hour.includes(',') &&
      !hour.includes('/')
    ) {
      return new DayCron({
        time: Moment(`${hour}:${minute}`, 'HH:mm'),
        isSchedule: hour !== '0' || minute !== '0'
      });
    } else if (day === '?') {
      return new WeekCron({
        time: Moment(`${hour}:${minute}`, 'HH:mm'),
        weeks: week.split(',')
      });
    } else if (day !== '*' && isStrNum(hour)) {
      // 每月多少号
      return new MonthCron({
        days: day.split(','),
        time: Moment(`${hour}:${minute}`, 'HH:mm')
      });
    } else if (minute.includes('/')) {
      const [beginMinute, stepMinute] = minute.split('/');
      const [beginHour, endHour] = hour.split('-');

      return new MinuteCron({
        beginTime: Moment(`${beginHour}:${beginMinute}`, 'HH:mm'),
        endTime: Moment(`${endHour}:00`, 'HH:mm'),
        stepMinute
      });
    } else {
      if (hour.includes(',')) {
        // 时间点
        return new HourCron({
          hours: hour.split(','),
          hasInterval: false
        });
      } else if (hour.includes('/')) {
        // 时间段
        const [duration, stepHour] = hour.split('/');
        const [beginHour, endHour] = hour.split('-');

        return new HourCron({
          beginTime: Moment(`${beginHour}:${minute}`, 'HH:mm'),
          endTime: Moment(`${endHour}:00`, 'HH:mm'),
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

  time = Moment('00:00', 'HH:mm');
  isSchedule = false;

  changeIsSchedule(isSchedule: boolean) {
    if (this.isSchedule && !isSchedule) {
      this.time = Moment('00:00', 'HH:mm');
    }

    this.isSchedule = isSchedule;
  }

  /** 产生预测时间-Day */
  getPredictedTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const time = this.time;
    const now = Moment();
    // 当前时间之前是否是设置时间之前，若之前，则直接从第二天计算开始，否则从当天时间开始
    const isBefore = now.isBefore(time)
    const predictedTimes = getArr(times).map((current, index) =>
      `${Moment(time).add(isBefore ? index : index + 1, 'days').format(format)}`)

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
  time = Moment('00:00', 'HH:mm');

  format() {
    const { days, time } = this;

    return `0 ${time.minutes()} ${time.hours()} ${
      days.length > 0 ? days.join(',') : '*'
      } * ?`;
  }

  /** 产生预测时间-Month */
  getPredictedTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const { days, time } = this;
    const now = Moment();
    const currentDay = Moment().format('DD');
    let predictedTimes = []
    if (days && days.length > 0) {
      const sortedDays = days.sort((a, b) => +a - +b)
      if (days.length > times) {
        // 找到若插入sortedDays中的索引
        const sortedIndex = _.sortedIndex(sortedDays, +currentDay);
        predictedTimes = [..._.sortedUniq(sortedDays.slice(sortedIndex)), ..._.sortedUniq(sortedDays.slice(0, sortedIndex))]
          .slice(0, times).map(selectedDay => {
            const diff = +selectedDay - +currentDay
            // 为当天时，则比较具体的时间
            if (diff === 0) {
              const isBefore = now.isBefore(time)
              return Moment(time).add(isBefore ? 0 : 1, 'months').format(format);
            } else {
              return Moment(time).add(diff >= 0 ? 0 : 1, 'months').add(`${diff}`, 'days').format(format);
            }
          }).sort((a, b) => {
            return +Moment(a).format('YYYYMMDD') - +Moment(b).format('YYYYMMDD');
          })
      } else {
        while (predictedTimes.length <= 5) {
          // TODO: 每一个月的XX号都执行
        }
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
  time = Moment('00:00', 'HH:mm');

  format() {
    const { weeks, time } = this;
    return `0 ${time.minutes()} ${time.hours()} ? * ${
      weeks.length > 0 ? weeks.join(',') : '*'
      }`;
  }
  /** 产生预测时间-Month */
  getPredictedTimes(times = 5, format = DEFAULT_FORMAT): string[] {
    const { weeks, time } = this;
    const curretWeek = +Moment().format('E') % 7 + 1;
    let predictedTimes = []

    if (weeks && weeks.length > 0) {
      if (weeks.length >= times) {
        // 找到若插入sortedDays中的索引
        const sortedIndex = _.sortedIndex(weeks, +curretWeek);
        predictedTimes = [..._.sortedUniq(weeks.slice(sortedIndex)), ..._.sortedUniq(weeks.slice(0, sortedIndex))]
          .slice(0, times).map((curret, index) => {
            const diff = +curretWeek - +curret;
            if (diff === 0) {
              const isBefore = Moment().isBefore(time)
              return Moment(time).add(isBefore ? 0 : 1, 'weeks').format(format);
            } else {
              return Moment(time).add(diff >= 0 ? 1 : 0, 'weeks').add(`${Math.abs(diff)}`, 'days').format(format)
            }
          }).sort((a, b) => {
            return +Moment(a).format('YYYYMMDD') - +Moment(b).format('YYYYMMDD');
          })
      } else {

      }

    }
    console.log('predictedTimes', predictedTimes)
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
  beginTime?= Moment('00:00', 'HH:mm');
  // endTime minutes only 59
  endTime?= Moment('23:59', 'HH:mm');
  stepHour?= '1';

  format() {
    const { hasInterval, beginTime, endTime, hours, stepHour } = this;

    if (hasInterval) {
      return `0 ${beginTime.minutes()} ${beginTime.hours()}-${endTime.hours()}/${stepHour} * * ?`;
    } else {
      return `0 0 ${hours.length > 0 ? hours.join(',') : '*'} * * ?`;
    }
  }

  constructor(cron: Partial<HourCron>) {
    super();
    this.init(cron);
  }
}

class MinuteCron extends Cron {
  readonly periodType = PeriodType.minute;

  beginTime?= Moment('00:00', 'HH:mm');
  endTime?= Moment('23:59', 'HH:mm');
  stepMinute?= '05';

  format() {
    const { beginTime, endTime, stepMinute } = this;

    return `0 */${stepMinute} ${beginTime.hours()}-${endTime.hours()} * * ?`;
  }

  constructor(cron: Partial<MinuteCron>) {
    super();
    this.init(cron);
  }
}
