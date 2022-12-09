# 0.4.2 / 2022-12-09
- fix: 修复周,月,小时调度选择器可以随意输入值的问题
- feat: 增加参数enableScheduleTime控制单独开启起调时间
# 0.4.1 / 2022-11-29
- fix: 修复周调度选择器始终有红色边框的问题 #31
# 0.4.0 / 2022-11-07
- feat: 时间点、时间段切换由Radio改为Select
- feat: 日调度和小时调度，时间段的选择由开始结束两个TimePicker改为一个RangePicker
# 0.3.21 / 2022-03-21
- fix: 月调度‘最近的生成时间’计算逻辑修正
- feat: 适配 Java Spring 的周调度定义
# 0.3.19 / 2022-02-24
- fix: 解决分钟级别最近更新时间不准确问题
# 0.3.18 / 2021-08-08
- feat: 增加twoHourItemsRequired 熟悉解决小时调度二义性问题
- fix: 解决表达式中的小时结束时间问题
# 0.3.17 / 2021-04-25
- feat: 新增获取最新时间方法
# 0.3.16 / 2021-04-19
- feat:新增delay参数： T+n(delay)。默认为1，如果当前参数传递为0，那么任务执行时间就按当前时间往后的执行时间
# 0.3.15 / 2021-04-08
- feat: add recentTimeNum prop for customizing recent times to display
# 0.3.14 / 2021-04-08
- fix: 修复时间间隔与起始时间超过60的特殊情况
# 0.3.13 / 2021-04-08
- fix: 修复 30/30 没有60的特殊情况
# 0.3.12 / 2021-04-01
- fix: 修复选择时间为空时，提示无效信息

# 0.3.11 / 2021-01-06
- feat: 支持关闭cron表达式的严格校验逻辑，默认是打开
# 0.3.9 / 2020-10-19

- fix 修复分钟类型，间隔为30分时预测时间不能时整点的问题

# 0.3.8 / 2020-09-02

- support case where day of week value ranges from 0 to 6

# 0.3.7 / 2020-07-28

- fix 修复预测时间初始化问题

# 0.3.6 / 2020-05-06

- fix 修复周预测时间问题

# 0.3.5 / 2020-04-17

- fix 周期类型分钟类型不能选择分钟问题

# 0.3.4 / 2019-11-07

- fix 周期类型小时选择开始时间时不自动设置分钟

# 0.3.3 / 2019-11-07

- fix getArr count problem

# 0.3.2 / 2019-11-07

- onClear bugfix

# 0.2.19 / 2019-08-01

- delete default value and bugfix

# 0.2.18 / 2019-07-31

- add beginTime and endTime

# 0.2.17 / 2019-07-25

- update cronValidate

  # 0.2.13 / 2019-04-19

- deploy 0.2.12

  # 0.2.12 / 2019-04-16

- deploy 0.2.11

  # 0.2.11 / 2019-04-16

- deploy 0.2.10

  # 0.2.10 / 2019-04-16

- deploy 0.2.9

  # 0.2.9 / 2019-03-29

- fix: fix disabled

  # 0.2.8 / 2019-02-18

- chore: update version

  # 0.2.6 / 2019-01-14

- Merge branch 'master' of github.com:nefe/one-cron

  # 0.2.5 / 2019-01-14

- deploy 0.2.4

  # 0.2.4 / 2018-12-25

- Merge pull request #9 from nefe/feat/addDisabledHours

  # 0.2.3 / 2018-12-24

- Merge pull request #8 from nefe/feat/addDisabledHours

  # 0.2.2 / 2018-12-21

- Merge pull request #7 from nefe/feat/addDisabledHours

  # 0.2.1 / 2018-11-20

- Merge pull request #6 from nefe/fix/syntaxError

  # 0.2.0 / 2018-10-15

- Merge pull request #5 from nefe/feat/addChineseTraditional

  # 0.1.18 / 2018-09-06

- fix: fix i18n text uppercase

  # 0.1.17 / 2018-08-07

- fix: fix month cron

  # 0.1.16 / 2018-06-25

- add periodType in className

  # 0.1.15 / 2018-06-11

- fix: fix week cron pos

  # 0.1.14 / 2018-06-11

- fix: fix cwr cronexp

  # 0.1.13 / 2018-06-11

- fix: fix cron is empty initilly

  # 0.1.12 / 2018-06-11

- add export \* in cronutils

  # 0.1.11 / 2018-06-11

- deploy 0.1.10

  # 0.1.10 / 2018-06-11

- fix: fix week items

# 0.1.9 / 2018-06-11

- fix: fix week crontab expression

# 0.1.8 / 2018-06-04

- feat: rebuild
