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

export enum LangEnum {
  zh_CN = 'zh_CN',
  en_US = 'en_US',
  zh_TW = 'zh_TW'
}

// 中文简体
let I18NList = {
  expTitle: 'cron 表达式',
  recentTimes:'最近的生成时间',
  start: '开始',
  end: '结束',
  step: '间隔',
  stepMinuteUnit: '分钟',
  stepHourUnit: '小时',
  hourUnit: '时',
  period: '时间段',
  point: '时间点',
  timing: '定时',
  translateMap: {
    day: '日',
    week: '周',
    month: '月',
    hour: '小时',
    minute: '分钟'
  },
  weekItemsList: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  dayItemsList: getArr(31, 1).map(num => `${num}日`),
  errorCronExp: 'cron表达式语法错误'
};

// 中文繁体
let I18NList_traditional = {
  expTitle: 'cron 表達式',
  recentTimes:'最近的生成時間',
  start: '開始',
  end: '結束',
  step: '間隔',
  stepMinuteUnit: '分鐘',
  stepHourUnit: '小時',
  hourUnit: '時',
  period: '時間段',
  point: '時間點',
  timing: '定時',
  translateMap: {
    day: '日',
    week: '周',
    month: '月',
    hour: '小時',
    minute: '分鐘'
  },
  weekItemsList: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  dayItemsList: getArr(31, 1).map(num => `${num}日`),
  errorCronExp: 'cron表達式語法錯誤'
};

/**
 * 得到一个I18N json
 * @param lang 语言
 */
function getI18N(lang = LangEnum.zh_CN): typeof I18NList {
  if (lang === LangEnum.zh_CN) {
    return I18NList;
  } else if (lang === LangEnum.en_US) {
    I18NList = {
      expTitle: 'cron expression',
      recentTimes: 'Recently generated time',
      start: 'Start',
      end: 'End',
      step: 'Interval',
      stepMinuteUnit: 'Minute',
      stepHourUnit: 'Hour',
      hourUnit: ':00',
      period: 'Time Period',
      point: 'Time Point',
      timing: 'Timed Dispatch',
      translateMap: {
        day: 'Day',
        week: 'Week',
        month: 'Month',
        hour: 'Hour',
        minute: 'Minute'
      },
      weekItemsList: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
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
      errorCronExp: 'Sorry,there has syntax error in Cron Expression.'
    };
  } else if (lang === LangEnum.zh_TW) {
    I18NList = I18NList_traditional;
  }
  return I18NList;
}
export { getI18N, getArr };
