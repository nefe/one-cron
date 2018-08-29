/**
 * 得到一个数组
 * @param length 数组长度
 * @param beginNum 第一个元素值
 */

function getArr(length: number, beginNum = 0, arr = []): number[] {
  if (length <= 0) {
    return arr;
  }

  return getArr(length - 1, beginNum + 1, [...arr, beginNum]);
}

let I18NList = {
  start: "开始",
  end: "结束",
  step: "间隔",
  stepMinuteUnit: "分钟",
  stepHourUnit: "小时",
  hourUnit: "时",
  period: "时间段",
  point: "时间点",
  timing: "定时",
  translateMap: {
    day: "日",
    week: "周",
    month: "月",
    hour: "小时",
    minute: "分钟"
  },
  weekItemsList: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  dayItemsList: getArr(31, 1).map(num => `${num}日`),
  errorCronExp:'cron表达式语法错误'
};

/**
 * 得到一个I18N json
 * @param lang 语言
 */
function getI18N(lang = "Chinese"): typeof I18NList {
  if (lang === "Chinese") {
    return I18NList;
  } else if (lang === "English") {
    I18NList = {
      start: "Start",
      end: "End",
      step: "Interval",
      stepMinuteUnit: "minute",
      stepHourUnit: "hour",
      hourUnit: ":00",
      period: "Time period",
      point: "Time Point",
      timing: "Timed Dispatch",
      translateMap: {
        day: "Day",
        week: "Week",
        month: "Month",
        hour: "Hour",
        minute: "Minute"
      },
      weekItemsList: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      dayItemsList: getArr(31, 1).map(num => {
        let day;
        if (num === 1 || num === 21 || num === 31) {
          day = `${num}st`;
        } else if (num === 2 || num === 22) {
          day = `${num}nd`;
        } else if (num === 3 || num === 23) {
          day = `${num}rd`;
        } else {
          day = `${num}th`;
        }
        return day;
      }),
      errorCronExp:'Sorry,there has syntax error in Cron Expression.'
    };
  }
  return I18NList;
}
export { getI18N, getArr };
