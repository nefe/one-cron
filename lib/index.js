(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("antd"), require("lodash"), require("moment"), require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["antd", "lodash", "moment", "react"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("antd"), require("lodash"), require("moment"), require("react")) : factory(root["antd"], root["lodash"], root["moment"], root["React"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * 得到一个数组
 * @param length 数组长度
 * @param beginNum 第一个元素值
 */
Object.defineProperty(exports, "__esModule", { value: true });
function getArr(length, beginNum, arr) {
    if (beginNum === void 0) { beginNum = 0; }
    if (arr === void 0) { arr = []; }
    if (length <= 0) {
        return arr;
    }
    return getArr(length - 1, beginNum + 1, arr.concat([beginNum]));
}
exports.getArr = getArr;
var I18NList = {
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
    weekItemsList: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    dayItemsList: getArr(31, 1).map(function (num) { return num + "\u65E5"; })
};
/**
 * 得到一个I18N json
 * @param lang 语言
 */
function getI18N(lang) {
    if (lang === void 0) { lang = "Chinese"; }
    if (lang === "Chinese") {
        return I18NList;
    }
    else if (lang === "English") {
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
            weekItemsList: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            dayItemsList: getArr(31, 1).map(function (num) {
                var day;
                if (num === 1 || num === 21 || num === 31) {
                    day = num + "st";
                }
                else if (num === 2 || num === 22) {
                    day = num + "nd";
                }
                else if (num === 3 || num === 23) {
                    day = num + "rd";
                }
                else {
                    day = num + "th";
                }
                return day;
            })
        };
    }
    return I18NList;
}
exports.getI18N = getI18N;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(6);
var antd_1 = __webpack_require__(3);
var cronUtils_1 = __webpack_require__(2);
var I18N_1 = __webpack_require__(0);
var Option = antd_1.Select.Option;
var RadioGroup = antd_1.Radio.Group;
function getOptions(items) {
    return items.map(function (item) {
        return (React.createElement(Option, { key: item.value, value: item.value }, item.text));
    });
}
var I18NEnum;
(function (I18NEnum) {
    I18NEnum["Chinese"] = "Chinese";
    I18NEnum["English"] = "English";
})(I18NEnum = exports.I18NEnum || (exports.I18NEnum = {}));
var OneCronProps = /** @class */ (function () {
    function OneCronProps() {
        this.cronExpression = "0 0 0 * * ?";
        this.onChange = function (exp) { };
        this.lang = 'English';
        this.showCheckbox = false;
    }
    return OneCronProps;
}());
exports.OneCronProps = OneCronProps;
var OneCron = /** @class */ (function (_super) {
    __extends(OneCron, _super);
    function OneCron(props) {
        var _this = _super.call(this, props) || this;
        var cron = cronUtils_1.Cron.getCronFromExp(props.cronExpression);
        _this.state = {
            cron: cron,
            cronType: cron.periodType,
            isEmpty: !props.cronExpression
        };
        return _this;
    }
    OneCron.prototype.handleChangePeriodType = function (periodType) {
        var _this = this;
        this.setState({
            cron: cronUtils_1.Cron.getCronFromPeriodType(periodType),
            cronType: periodType
        }, function () {
            _this.props.onChange(_this.state.cron);
        });
    };
    OneCron.prototype.triggerChange = function () {
        this.props.onChange(this.state.cron);
        this.forceUpdate();
    };
    OneCron.prototype.renderDetail = function () {
        var _this = this;
        var cron = this.state.cron;
        var _a = this.props, lang = _a.lang, showCheckbox = _a.showCheckbox;
        var sLang = I18NEnum[lang];
        var I18N = I18N_1.getI18N(sLang);
        var getCommonProps = function (cronBO, key) {
            return {
                value: cronBO[key],
                onChange: function (value) {
                    cronBO[key] = value;
                    _this.triggerChange();
                }
            };
        };
        switch (cron.periodType) {
            case cronUtils_1.PeriodType.day: {
                if (showCheckbox && !cron.isSchedule) {
                    return null;
                }
                if (!showCheckbox) {
                    // showCheckbox关闭，则说明默认自动调度任务
                    cron.changeIsSchedule(!showCheckbox);
                }
                return React.createElement(antd_1.TimePicker, __assign({ format: "HH:mm" }, getCommonProps(cron, "time")));
            }
            case cronUtils_1.PeriodType.week: {
                return (React.createElement("span", null,
                    React.createElement(antd_1.Select, __assign({ mode: "tags", style: { width: 200 } }, getCommonProps(cron, "weeks")), getOptions(cronUtils_1.getWeekItems(sLang))),
                    React.createElement(antd_1.TimePicker, __assign({ format: "HH:mm" }, getCommonProps(cron, "time")))));
            }
            case cronUtils_1.PeriodType.month: {
                return (React.createElement("span", null,
                    React.createElement(antd_1.Select, __assign({ mode: "tags", style: { width: 200 } }, getCommonProps(cron, "days")), getOptions(cronUtils_1.getDayItems(sLang))),
                    React.createElement(antd_1.TimePicker, __assign({ format: "HH:mm" }, getCommonProps(cron, "time")))));
            }
            case cronUtils_1.PeriodType.minute: {
                return (React.createElement("span", null,
                    React.createElement("span", { className: "form-item" },
                        React.createElement("span", { className: "form-item-title" }, I18N.start),
                        React.createElement(antd_1.TimePicker, __assign({ format: "HH:mm" }, getCommonProps(cron, "beginTime")))),
                    React.createElement("span", { className: "form-item" },
                        React.createElement("span", { className: "form-item-title" }, I18N.step),
                        React.createElement(antd_1.Select, __assign({ style: { width: 100 } }, getCommonProps(cron, "stepMinute")), getOptions(cronUtils_1.getStepMinuteItems)),
                        React.createElement("span", { style: { marginRight: 20 } }, I18N.stepMinuteUnit)),
                    React.createElement("span", { className: "form-item" },
                        React.createElement("span", { className: "form-item-title" }, I18N.end),
                        React.createElement(antd_1.TimePicker, __assign({ format: "HH:mm" }, getCommonProps(cron, "endTime"))))));
            }
            case cronUtils_1.PeriodType.hour: {
                return (React.createElement("span", null,
                    React.createElement(RadioGroup, { value: cron.hasInterval ? "step" : "point", onChange: function (e) {
                            cron.hasInterval = e.target.value === "step";
                            _this.triggerChange();
                        } },
                        React.createElement(antd_1.Radio, { value: "step" }, I18N.period),
                        React.createElement(antd_1.Radio, { value: "point" }, I18N.point)),
                    cron.hasInterval ? (React.createElement("span", null,
                        React.createElement("span", { className: "form-item" },
                            React.createElement("span", { className: "form-item-title" }, I18N.start),
                            React.createElement(antd_1.TimePicker, __assign({ format: "HH:mm" }, getCommonProps(cron, "beginTime")))),
                        React.createElement("span", { className: "form-item" },
                            React.createElement("span", { className: "form-item-title" }, I18N.step),
                            React.createElement(antd_1.Select, __assign({ style: { width: 100 } }, getCommonProps(cron, "stepHour")), getOptions(cronUtils_1.getSteoHourItems)),
                            React.createElement("span", { style: { marginRight: 20 } }, I18N.stepHourUnit)),
                        React.createElement("span", { className: "form-item" },
                            React.createElement("span", { className: "form-item-title" }, I18N.end),
                            React.createElement(antd_1.TimePicker, __assign({ format: "HH:mm" }, getCommonProps(cron, "endTime")))))) : (React.createElement(antd_1.Select, { mode: "tags", value: cron.hours, style: { width: 200 }, onChange: function (value) {
                            cron.hours = value;
                            _this.triggerChange();
                        } }, getOptions(cronUtils_1.getHourItems(sLang))))));
            }
            default: {
                return null;
            }
        }
    };
    OneCron.prototype.render = function () {
        var _this = this;
        var _a = this.props, cronExpression = _a.cronExpression, onChange = _a.onChange, lang = _a.lang, showCheckbox = _a.showCheckbox;
        var sLang = I18NEnum[lang];
        var I18N = I18N_1.getI18N(sLang);
        var cron = this.state.cron;
        return (React.createElement("span", { className: "schedule-period" },
            React.createElement(antd_1.Select, { value: cron.periodType, onChange: this.handleChangePeriodType.bind(this) }, getOptions(cronUtils_1.getPeriodItems(sLang))),
            !!showCheckbox && (React.createElement(antd_1.Checkbox, { onChange: function (e) {
                    cron.changeIsSchedule(e.target.checked);
                    _this.triggerChange();
                }, disabled: cron.periodType !== cronUtils_1.PeriodType.day, checked: cron.periodType !== cronUtils_1.PeriodType.day ? true : cron.isSchedule },
                React.createElement("span", { className: "timing" }, I18N.timing))),
            this.renderDetail()));
    };
    OneCron.defaultProps = new OneCronProps();
    return OneCron;
}(React.Component));
exports.default = OneCron;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Moment = __webpack_require__(5);
var _ = __webpack_require__(4);
var I18N_1 = __webpack_require__(0);
function isStrNum(str) {
    return !Number.isNaN(Number(str));
}
exports.isStrNum = isStrNum;
var PeriodType;
(function (PeriodType) {
    PeriodType["day"] = "day";
    PeriodType["week"] = "week";
    PeriodType["month"] = "month";
    PeriodType["hour"] = "hour";
    PeriodType["minute"] = "minute";
})(PeriodType = exports.PeriodType || (exports.PeriodType = {}));
exports.getPeriodItems = function (lang) {
    return Object.values(PeriodType).map(function (item) {
        var I18N = I18N_1.getI18N(lang);
        var TranslateMap = I18N["translateMap"];
        return {
            text: TranslateMap[item],
            value: item
        };
    });
};
exports.getHourItems = function (lang) {
    var hourUnit = I18N_1.getI18N(lang).hourUnit;
    return I18N_1.getArr(24).map(function (num) { return ({
        text: "" + num + hourUnit,
        value: String(num)
    }); });
};
exports.getDayItems = function (lang) {
    var dayItemsList = I18N_1.getI18N(lang).dayItemsList;
    return dayItemsList.map(function (num) {
        return {
            text: "" + num,
            value: String(num.replace(/[^0-9]/gi, ""))
        };
    });
};
exports.getWeekItems = function (lang) {
    var I18N = I18N_1.getI18N(lang);
    var weekItemsList = I18N["weekItemsList"];
    return weekItemsList.map(function (day, dayIndex) {
        return {
            text: day,
            value: dayIndex + ""
        };
    });
};
exports.getSteoHourItems = I18N_1.getArr(12, 1).map(function (num) {
    return {
        text: num + "",
        value: num + ""
    };
});
exports.getStepMinuteItems = [
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
].map(function (num) {
    var str = String(num + 100).slice(1);
    return {
        text: str,
        value: str
    };
});
var Cron = /** @class */ (function () {
    function Cron() {
    }
    Cron.prototype.init = function (cron) {
        var _this = this;
        _.forEach(cron, function (value, key) {
            if (value !== "periodType") {
                _this[key] = value;
            }
        });
    };
    Cron.getCronFromPeriodType = function (periodType) {
        if (periodType === PeriodType.day) {
            return new DayCron({});
        }
        else if (periodType === PeriodType.week) {
            return new WeekCron({});
        }
        else if (periodType === PeriodType.month) {
            return new MonthCron({});
        }
        else if (periodType === PeriodType.hour) {
            return new HourCron({});
        }
        else if (periodType === PeriodType.minute) {
            return new MinuteCron({});
        }
        else if (periodType === PeriodType.hour) {
            return new HourCron({});
        }
    };
    Cron.getCronFromExp = function (cronExp) {
        if (!cronExp) {
            return new DayCron({});
        }
        var _a = cronExp.split(" "), second = _a[0], _b = _a[1], minute = _b === void 0 ? "" : _b, _c = _a[2], hour = _c === void 0 ? "" : _c, day = _a[3], week = _a[4], month = _a[5];
        if (day === "*" &&
            !minute.includes("/") &&
            !hour.includes(",") &&
            !hour.includes("/")) {
            return new DayCron({
                time: Moment(hour + ":" + minute, "HH:mm"),
                isSchedule: hour !== "0" || minute !== "0"
            });
        }
        else if (day === "?") {
            return new WeekCron({
                time: Moment(hour + ":" + minute, "HH:mm"),
                weeks: week.split(",")
            });
        }
        else if (day !== "*" && isStrNum(hour)) {
            return new MonthCron({
                days: day.split(","),
                time: Moment(hour + ":" + minute, "HH:mm")
            });
        }
        else if (minute.includes("/")) {
            var _d = minute.split("/"), beginMinute = _d[0], stepMinute = _d[1];
            var _e = hour.split("-"), beginHour = _e[0], endHour = _e[1];
            return new MinuteCron({
                beginTime: Moment(beginHour + ":" + beginMinute, "HH:mm"),
                endTime: Moment(endHour + ":00", "HH:mm"),
                stepMinute: stepMinute
            });
        }
        else {
            if (hour.includes(",")) {
                // 时间点
                return new HourCron({
                    hours: hour.split(","),
                    hasInterval: false
                });
            }
            else if (hour.includes("/")) {
                // 时间段
                var _f = hour.split("/"), duration = _f[0], stepHour = _f[1];
                var _g = hour.split("-"), beginHour = _g[0], endHour = _g[1];
                return new HourCron({
                    beginTime: Moment(beginHour + ":" + minute, "HH:mm"),
                    endTime: Moment(endHour + ":00", "HH:mm"),
                    stepHour: stepHour,
                    hasInterval: true // 有时间段，默认为true
                });
            }
            else {
                return new HourCron({ hours: [] });
            }
        }
    };
    return Cron;
}());
exports.Cron = Cron;
var DayCron = /** @class */ (function (_super) {
    __extends(DayCron, _super);
    function DayCron(cron) {
        var _this = _super.call(this) || this;
        _this.periodType = PeriodType.day;
        _this.time = Moment("00:00", "HH:mm");
        _this.isSchedule = false;
        _this.init(cron);
        return _this;
    }
    DayCron.prototype.changeIsSchedule = function (isSchedule) {
        if (this.isSchedule && !isSchedule) {
            this.time = Moment("00:00", "HH:mm");
        }
        this.isSchedule = isSchedule;
    };
    DayCron.prototype.format = function () {
        var time = this.time;
        return "0 " + time.minutes() + " " + time.hours() + " * * ?";
    };
    return DayCron;
}(Cron));
exports.DayCron = DayCron;
var MonthCron = /** @class */ (function (_super) {
    __extends(MonthCron, _super);
    function MonthCron(cron) {
        var _this = _super.call(this) || this;
        _this.periodType = PeriodType.month;
        _this.days = [];
        _this.time = Moment("00:00", "HH:mm");
        _this.init(cron);
        return _this;
    }
    MonthCron.prototype.format = function () {
        var _a = this, days = _a.days, time = _a.time;
        return "0 " + time.minutes() + " " + time.hours() + " " + days.join(",") + " * * ?";
    };
    return MonthCron;
}(Cron));
var WeekCron = /** @class */ (function (_super) {
    __extends(WeekCron, _super);
    function WeekCron(cron) {
        var _this = _super.call(this) || this;
        _this.periodType = PeriodType.week;
        _this.weeks = [];
        _this.time = Moment("00:00", "HH:mm");
        _this.init(cron);
        return _this;
    }
    WeekCron.prototype.format = function () {
        var _a = this, weeks = _a.weeks, time = _a.time;
        return "0 " + time.minutes() + " " + time.hours() + " ? " + weeks.join(",") + " *";
    };
    return WeekCron;
}(Cron));
var HourCron = /** @class */ (function (_super) {
    __extends(HourCron, _super);
    function HourCron(cron) {
        var _this = _super.call(this) || this;
        _this.periodType = PeriodType.hour;
        /** 是否使用时间段 */
        _this.hasInterval = false;
        _this.hours = [];
        _this.beginTime = Moment("00:00", "HH:mm");
        _this.endTime = Moment("00:00", "HH:mm");
        _this.stepHour = "1";
        _this.init(cron);
        return _this;
    }
    HourCron.prototype.format = function () {
        var _a = this, hasInterval = _a.hasInterval, beginTime = _a.beginTime, endTime = _a.endTime, hours = _a.hours, stepHour = _a.stepHour;
        if (hasInterval) {
            return "0 " + beginTime.minutes() + " " + beginTime.hours() + "-" + endTime.hours() + "/" + stepHour + " * * ?";
        }
        else {
            return "0 0 " + hours.join(",") + " * * ?";
        }
    };
    return HourCron;
}(Cron));
var MinuteCron = /** @class */ (function (_super) {
    __extends(MinuteCron, _super);
    function MinuteCron(cron) {
        var _this = _super.call(this) || this;
        _this.periodType = PeriodType.minute;
        _this.beginTime = Moment("00:00", "HH:mm");
        _this.endTime = Moment("00:00", "HH:mm");
        _this.stepMinute = "05";
        _this.init(cron);
        return _this;
    }
    MinuteCron.prototype.format = function () {
        var _a = this, beginTime = _a.beginTime, endTime = _a.endTime, stepMinute = _a.stepMinute;
        return "0 " + beginTime.minutes() + "/" + stepMinute + " " + beginTime.hours() + "-" + endTime.hours() + " * * ?";
    };
    return MinuteCron;
}(Cron));


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
/******/ ]);
});