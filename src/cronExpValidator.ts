/**
 * Validates a cron expression.
 *
 * @param cronExpression The expression to validate
 * @return True is expression is valid
 */
export function cronValidate(cronExpression: string) {
  var cronParams = cronExpression.split(" ");

  if (cronParams.length < 6 || cronParams.length > 7) {
    return false;
  }

  if (cronParams[3] == "?" || cronParams[5] == "?") {
    //Check seconds param
    if (!checkSecondsField(cronParams[0])) {
      return false;
    }

    //Check minutes param
    if (!checkMinutesField(cronParams[1])) {
      return false;
    }

    //Check hours param
    if (!checkHoursField(cronParams[2])) {
      return false;
    }

    //Check day-of-month param
    if (!checkDayOfMonthField(cronParams[3])) {
      return false;
    }

    //Check months param
    if (!checkMonthsField(cronParams[4])) {
      return false;
    }

    //Check day-of-week param
    if (!checkDayOfWeekField(cronParams[5])) {
      return false;
    }

    //Check year param
    if (cronParams.length == 7) {
      if (!checkYearField(cronParams[6])) {
        return false;
      }
    }

    return true;
  } else {
    return false;
  }
}

function checkSecondsField(secondsField: string) {
  return checkField(secondsField, 0, 59);
}

function checkField(secondsField: string, minimal: number, maximal: number) {
  if (secondsField.indexOf("-") > -1) {
    const startValue = secondsField.substring(0, secondsField.indexOf("-"));
    const endValue = secondsField.substring(secondsField.indexOf("-") + 1);
    if (
      !(
        checkIntValue(startValue, minimal, maximal, true) &&
        checkIntValue(endValue, minimal, maximal, true)
      )
    ) {
      return false;
    }
    try {
      const startVal = parseInt(startValue, 10);
      const endVal = parseInt(endValue, 10);

      return endVal >= startVal;
    } catch (e) {
      return false;
    }
  } else if (secondsField.indexOf(",") > -1) {
    return checkListField(secondsField, minimal, maximal);
  } else if (secondsField.indexOf("/") > -1) {
    return checkIncrementField(secondsField, minimal, maximal);
  } else if (secondsField.indexOf("*") != -1) {
    return true;
  } else {
    return checkIntValue(secondsField, minimal, maximal);
  }
}

function checkIntValue(
  value: string,
  minimal: number,
  maximal: number,
  checkExtremity?: boolean
) {
  try {
    if (value.indexOf("/") > -1) {
      return true;
    } else {
      const val = parseInt(value, 10);

      //判断是否为整数
      if (Number(value) === val) {
        if (checkExtremity) {
          if (val < minimal || val > maximal) {
            return false;
          }
        }
        return true;
      }
    }
  } catch (e) {
    return false;
  }
}

function checkMinutesField(minutesField: string) {
  return checkField(minutesField, 0, 59);
}

function checkHoursField(hoursField: string) {
  return checkField(hoursField, 0, 23);
}

function checkDayOfMonthField(dayOfMonthField: string) {
  // 多个时间
  if (dayOfMonthField.indexOf(",")) {
    return true;
  }
  if (dayOfMonthField == "?") {
    return true;
  }

  if (dayOfMonthField.indexOf("L") >= 0) {
    return checkFieldWithLetter(dayOfMonthField, "L", 1, 7, -1, -1);
  } else if (dayOfMonthField.indexOf("W") >= 0) {
    return checkFieldWithLetter(dayOfMonthField, "W", 1, 31, -1, -1);
  } else if (dayOfMonthField.indexOf("C") >= 0) {
    return checkFieldWithLetter(dayOfMonthField, "C", 1, 31, -1, -1);
  } else {
    return checkField(dayOfMonthField, 1, 31);
  }
}

function checkMonthsField(monthsField: string) {
  monthsField.replace("JAN", "1");
  monthsField.replace("FEB", "2");
  monthsField.replace("MAR", "3");
  monthsField.replace("APR", "4");
  monthsField.replace("MAY", "5");
  monthsField.replace("JUN", "6");
  monthsField.replace("JUL", "7");
  monthsField.replace("AUG", "8");
  monthsField.replace("SEP", "9");
  monthsField.replace("OCT", "10");
  monthsField.replace("NOV", "11");
  monthsField.replace("DEC", "12");

  return checkField(monthsField, 1, 31);
}

function checkDayOfWeekField(dayOfWeekField: string) {
  dayOfWeekField.replace("SUN", "1");
  dayOfWeekField.replace("MON", "2");
  dayOfWeekField.replace("TUE", "3");
  dayOfWeekField.replace("WED", "4");
  dayOfWeekField.replace("THU", "5");
  dayOfWeekField.replace("FRI", "6");
  dayOfWeekField.replace("SAT", "7");

  if (dayOfWeekField == "?") {
    return true;
  }

  if (dayOfWeekField.indexOf("L") >= 0) {
    return checkFieldWithLetter(dayOfWeekField, "L", 1, 7, -1, -1);
  } else if (dayOfWeekField.indexOf("C") >= 0) {
    return checkFieldWithLetter(dayOfWeekField, "C", 1, 7, -1, -1);
  } else if (dayOfWeekField.indexOf("#") >= 0) {
    return checkFieldWithLetter(dayOfWeekField, "#", 1, 7, 1, 5);
  } else {
    return checkField(dayOfWeekField, 1, 7);
  }
}

function checkYearField(yearField: string) {
  return checkField(yearField, 1970, 2099);
}

function checkFieldWithLetter(
  value,
  letter,
  minimalBefore,
  maximalBefore,
  minimalAfter,
  maximalAfter
) {
  let canBeAlone = false;
  let canHaveIntBefore = false;
  let canHaveIntAfter = false;
  let mustHaveIntBefore = false;
  let mustHaveIntAfter = false;

  if (letter == "L") {
    canBeAlone = true;
    canHaveIntBefore = true;
    canHaveIntAfter = false;
    mustHaveIntBefore = false;
    mustHaveIntAfter = false;
  }
  if (letter == "W" || letter == "C") {
    canBeAlone = false;
    canHaveIntBefore = true;
    canHaveIntAfter = false;
    mustHaveIntBefore = true;
    mustHaveIntAfter = false;
  }
  if (letter == "#") {
    canBeAlone = false;
    canHaveIntBefore = true;
    canHaveIntAfter = true;
    mustHaveIntBefore = true;
    mustHaveIntAfter = true;
  }

  let beforeLetter = "";
  let afterLetter = "";

  if (value.indexOf(letter) >= 0) {
    beforeLetter = value.substring(0, value.indexOf(letter));
  }

  if (!value.endsWith(letter)) {
    afterLetter = value.substring(value.indexOf(letter) + 1);
  }

  if (value.indexOf(letter) >= 0) {
    if (letter == value) {
      return canBeAlone;
    }

    if (canHaveIntBefore) {
      if (mustHaveIntBefore && beforeLetter.length == 0) {
        return false;
      }

      if (!checkIntValue(beforeLetter, minimalBefore, maximalBefore, true)) {
        return false;
      }
    } else {
      if (beforeLetter.length > 0) {
        return false;
      }
    }

    if (canHaveIntAfter) {
      if (mustHaveIntAfter && afterLetter.length == 0) {
        return false;
      }

      if (!checkIntValue(afterLetter, minimalAfter, maximalAfter, true)) {
        return false;
      }
    } else {
      if (afterLetter.length > 0) {
        return false;
      }
    }
  }

  return true;
}

function checkIncrementField(value, minimal, maximal) {
  const start = value.substring(0, value.indexOf("/"));
  const increment = value.substring(value.indexOf("/") + 1);

  if (!("*" === start)) {
    return (
      checkIntValue(start, minimal, maximal, true) &&
      checkIntValue(increment, minimal, maximal, false)
    );
  } else {
    return checkIntValue(increment, minimal, maximal, true);
  }
}

function checkListField(value, minimal, maximal) {
  const st = value.split(",");

  let values = new Array(st.length);

  for (var j = 0; j < st.length; j++) {
    values[j] = st[j];
  }

  let previousValue = -1;

  for (var i = 0; i < values.length; i++) {
    let currentValue = values[i];

    if (!checkIntValue(currentValue, minimal, maximal, true)) {
      return false;
    }

    try {
      let val = parseInt(currentValue, 10);

      if (val <= previousValue) {
        return false;
      } else {
        previousValue = val;
      }
    } catch (e) {}
  }

  return true;
}
