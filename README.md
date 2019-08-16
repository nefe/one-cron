# One-Cron

一款以 Cron Expressions 为桥梁的定时调度组件，支持国际化等功能。

![image](https://travis-ci.com/nefe/one-cron.svg?branch=master)
[![npm version](https://badge.fury.io/js/one-cron.png)](https://badge.fury.io/js/one-cron)
[![npm downloads](https://img.shields.io/npm/dt/one-cron.svg?style=flat-square)](https://www.npmjs.com/package/one-cron)

## Cron Expressions

下表简单介绍了一下 Cron Expressions 的  语法，详情请看[官方介绍](https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm)

| Expression          | Means                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 0 12 \* \* ?      | Fire at 12:00 PM (noon) every day                                                                                                             |
| 0 15 10 ? \* \*     | Fire at 10:15 AM every day                                                                                                                    |
| 0 0/5 14,18 \* \* ? | Fire every 5 minutes starting at 2:00 PM and ending at 2:55 PM, AND fire every 5 minutes starting at 6:00 PM and ending at 6:55 PM, every day |

## Documentation

| Name           | Type     | Default         | Description                                                                    |
| -------------- | -------- | --------------- | ------------------------------------------------------------------------------ |
| lang           | enum     | 'en_US'         | 选项:'zh_CN','en_US','zh_TW'                                                   |
| onChange       | Function |                 | 默认传来一个参数，为对象类型，提供 format 方法，可以拿到对应的 cron expression |
| cronExpression | String   | '0 0 0 \* \* ?' | 通过 cronExpression 的规则显示初始值                                           |
| showRecentTime | boolean  | false           | 显示最近 5 次生成时间                                                          |
| options        | Array    | 全部            | 数组值选项：'day', 'week', 'month', 'hour', 'minute'                           |
| disabled       | boolean  | false           | 不可操作                                                                       |
| beginTime      | number   | 0               | 可选择的起始时间                                                               |
| endTime        | number   | 24              | 可选择的结束时间                                                               |
| multiple        | boolean   | true              | 支持多选和单选，默认多选                                                               |
## License

MIT
