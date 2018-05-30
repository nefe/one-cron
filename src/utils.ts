// /**
//  * @author  zongquan.hzq
//  * @description 调度配置中的周期设置，由于该交互并不符合 cron 标准，因此注意该 cron 库可能不具有通用性。
//  */

// import * as Moment from "moment";
// import * as _ from "lodash";
// import { Select } from "antd";
// import * as React from "react";

// const Option = Select.Option;

// export function isStrNum(str: string) {
//   return !Number.isNaN(Number(str));
// }

// export enum PeriodType {
//   day = "day",
//   week = "week",
//   month = "month",
//   hour = "hour",
//   minute = "minute"
// }

// export enum Lang {
//   English,
//   Chinese
// }

// export const TranslateMap = {
//   [PeriodType.day]: I18N.task.TaskConfig.day,
//   [PeriodType.week]: I18N.task.TaskConfig.week,
//   [PeriodType.month]: I18N.task.TaskConfig.month,
//   [PeriodType.hour]: I18N.task.TaskConfig.hour,
//   [PeriodType.minute]: I18N.task.TaskConfig.minute
// };

// export function getOptions(items: Item[]) {
//   return items.map(item => {
//     return (
//       <Option key={item.value} value={item.value}>
//         {item.text}
//       </Option>
//     );
//   });
// }

// export const periodItems = Object.values(PeriodType).map(item => {
//   return {
//     text: TranslateMap[item],
//     value: item
//   };
// });

// export const hourItems = getArr(24).map(num => ({
//   text: I18N.template(I18N.Models.ScheduleConfig.time.hour, { val1: num }),
//   value: String(num)
// }));

// export const dayItems = getArr(31, 1).map(num => ({
//   text: I18N.template(I18N.Models.ScheduleConfig.time.day, { val1: num }),
//   value: String(num)
// }));

// export const weekItems = [
//   I18N.common.digit.one,
//   I18N.common.digit.two,
//   I18N.common.digit.three,
//   I18N.common.digit.four,
//   I18N.common.digit.five,
//   I18N.common.digit.six,
//   I18N.task.TaskConfig.day
// ].map((day, dayIndex) => {
//   return {
//     text: I18N.task.TaskConfig.week + day,
//     value: dayIndex + ""
//   };
// });

// export const stepItems = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(
//   num => {
//     const str = String(num + 100).slice(1);

//     return {
//       text: str,
//       value: str
//     };
//   }
// );

// export type AllCron = DayCron | WeekCron | MonthCron | HourCron | MinuteCron;

// export class Cron {
//   periodType: PeriodType;

//   init(cron: any) {
//     _.forEach(cron, (value, key) => {
//       if (value !== "periodType") {
//         this[key] = value;
//       }
//     });
//   }

//   static getCronFromPeriodType(periodType: PeriodType) {
//     if (periodType === PeriodType.day) {
//       return new DayCron({});
//     } else if (periodType === PeriodType.week) {
//       return new WeekCron({});
//     } else if (periodType === PeriodType.month) {
//       return new MonthCron({});
//     } else if (periodType === PeriodType.hour) {
//       return new HourCron({});
//     } else if (periodType === PeriodType.minute) {
//       return new MinuteCron({});
//     } else if (periodType === PeriodType.hour) {
//       return new HourCron({});
//     }
//   }

//   static getCronFromExp(cronExp: string) {
//     if (!cronExp) {
//       return new DayCron({});
//     }

//     const [second, minute = "", hour = "", day, week, month] = cronExp.split(
//       " "
//     );

//     if (
//       day === "*" &&
//       !minute.includes("/") &&
//       !hour.includes(",") &&
//       !hour.includes("/")
//     ) {
//       return new DayCron({
//         time: Moment(`${hour}:${minute}`, "HH:mm"),
//         isSchedule: hour !== "0" || minute !== "0"
//       });
//     } else if (day === "?") {
//       return new WeekCron({
//         time: Moment(`${hour}:${minute}`, "HH:mm"),
//         weeks: week.split(",")
//       });
//     } else if (day !== "*" && isStrNum(hour)) {
//       return new MonthCron({
//         days: day.split(","),
//         time: Moment(`${hour}:${minute}`, "HH:mm")
//       });
//     } else if (minute.includes("/")) {
//       const [beginMinute, stepMinute] = minute.split("/");
//       const [beginHour, endHour] = hour.split("-");

//       return new MinuteCron({
//         beginTime: Moment(`${beginHour}:${beginMinute}`, "HH:mm"),
//         endTime: Moment(`${endHour}:00`, "HH:mm"),
//         stepMinute
//       });
//     } else {
//       if (hour.includes(",")) {
//         // 时间点
//         return new HourCron({
//           hours: hour.split(",")
//         });
//       } else if (hour.includes("/")) {
//         // 时间段
//         const [duration, stepHour] = hour.split("/");
//         const [beginHour, endHour] = hour.split("-");

//         return new HourCron({
//           beginTime: Moment(`${beginHour}:${minute}`, "HH:mm"),
//           endTime: Moment(`${endHour}:00`, "HH:mm"),
//           stepHour
//         });
//       } else {
//         return new HourCron({ hours: [] });
//       }
//     }
//   }
// }

// export class DayCron extends Cron {
//   readonly periodType = PeriodType.day;

//   time = Moment("00:00", "HH:mm");
//   isSchedule = false;

//   changeIsSchedule(isSchedule: boolean) {
//     if (this.isSchedule && !isSchedule) {
//       this.time = Moment("00:00", "HH:mm");
//     }

//     this.isSchedule = isSchedule;
//   }

//   format() {
//     const time = this.time;

//     return `0 ${time.minutes()} ${time.hours()} * * ?`;
//   }

//   constructor(cron: Partial<DayCron>) {
//     super();
//     this.init(cron);
//   }
// }

// class MonthCron extends Cron {
//   readonly periodType = PeriodType.month;

//   days = [] as string[];
//   time = Moment("00:00", "HH:mm");

//   format() {
//     const { days, time } = this;

//     return `0 ${time.minutes()} ${time.hours()} ${days.join(",")} * * ?`;
//   }

//   constructor(cron: Partial<MonthCron>) {
//     super();
//     this.init(cron);
//   }
// }

// class WeekCron extends Cron {
//   readonly periodType = PeriodType.week;

//   weeks = [] as string[];
//   time = Moment("00:00", "HH:mm");

//   format() {
//     const { weeks, time } = this;

//     return `0 ${time.minutes()} ${time.hours()} ? ${weeks.join(",")} *`;
//   }

//   constructor(cron: Partial<WeekCron>) {
//     super();
//     this.init(cron);
//   }
// }

// class HourCron extends Cron {
//   readonly periodType = PeriodType.hour;

//   /** 是否使用时间段 */
//   hasInterval = false;
//   hours? = [] as string[];
//   beginTime? = Moment("00:00", "HH:mm");
//   endTime? = Moment("00:00", "HH:mm");
//   stepHour? = "5";

//   format() {
//     const { hasInterval, beginTime, endTime, hours, stepHour } = this;

//     if (hasInterval) {
//       return `0 ${beginTime.minutes()} ${beginTime.hours()}-${endTime.hours()}/${stepHour} * * ?`;
//     } else {
//       return `0 0 ${hours.join(",")} * * ?`;
//     }
//   }

//   constructor(cron: Partial<HourCron>) {
//     super();
//     this.init(cron);
//   }
// }

// class MinuteCron extends Cron {
//   readonly periodType = PeriodType.minute;

//   beginTime? = Moment("00:00", "HH:mm");
//   endTime? = Moment("00:00", "HH:mm");
//   stepMinute? = "5";

//   format() {
//     const { beginTime, endTime, stepMinute } = this;

//     return `0 ${beginTime.minutes()}/${stepMinute} ${beginTime.hours()}-${endTime.hours()} * * ?`;
//   }

//   constructor(cron: Partial<MinuteCron>) {
//     super();
//     this.init(cron);
//   }
// }
