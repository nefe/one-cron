
/** 不同语言对于周调度的取值不同 */
export const enum DayOfWeekType {
  // 周日到周六对应 0-6 
  Linux = 'Linux',
  // 周一到周日对应 1-7
  Spring = 'Spring',
  // 周日到周六对应 1-7
  Quartz = 'Quartz',
}