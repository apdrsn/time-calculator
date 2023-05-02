import { ERROR_WRONG_FORMAT, SUCCES_CORRECT_FORMAT } from "./constants";

export type formatType = "DECIMAL" | "TIME";

export const getTimeAsNumber = (
  value: string,
  format: formatType = "TIME"
): Record<string, number> => {
  const stringArray = value.split(format === "TIME" ? ":" : ",");

  return {
    hours: parseInt(stringArray[0], 10),
    minutes: parseInt(stringArray[1], 10),
  };
};

export const timeToDecimalFormat = (
  value: string,
  format: formatType = "TIME"
) => {
  const { hours, minutes } = getTimeAsNumber(value, format);

  const hoursString = hours.toString();
  const minutesString = (minutes / 60)
    .toFixed(2)
    .toString()
    .slice(2)
    .padEnd(2, "0");

  return `${hoursString},${minutesString}`;
};

export const negativeOrPositiveFourDigitsTime = (
  value: string,
  delimiter: "," | ":"
) => {
  if (value[0] === "-") {
    return `-${value.slice(1, 3)}${delimiter}${value.slice(3)}`;
  }

  return value.slice(0, 2) + delimiter + value.slice(2);
};

export const negativeOrPositiveThreeDigitsTime = (
  value: string,
  delimiter: "," | ":"
) => {
  if (value[0] === "-") {
    return `-${delimiter === ":" ? "0" : ""}${value.slice(
      1,
      2
    )}${delimiter}${value.slice(2)}`;
  }

  return `${delimiter === ":" ? "0" : ""}${value.slice(
    0,
    1
  )}${delimiter}${value.slice(1)}`;
};

export const createReturn = (value: string, isError: boolean = false) => {
  return {
    value,
    status: isError ? ERROR_WRONG_FORMAT : SUCCES_CORRECT_FORMAT,
  };
};

export const validateAndSanitizeTimeInput = (
  value: string,
  format: formatType = "TIME",
  allowOverFlow: boolean = false
) => {
  const isDecimal = format === "DECIMAL";
  const isAllowingOverflow = isDecimal || allowOverFlow;
  const delimiter = isDecimal ? "," : ":";

  const fullFormatTime = /^([0-1]?\d|2[0-3]):[0-5]\d$/;
  const fullFormatTimeOverflow = /^-?\d{2,}:[0-5]\d$/;
  const fullFormatDecimal = /^-?\d{1,},\d{2}$/;
  const shortFormatTime = /^([0-1]?\d|2[0-3]):[0-5]$/;
  const shortFormatTimeOverflow = /^-?\d{1,}:[0-5]$/;
  const shortFormatDecimal = /^-?\d{1,},\d$/;
  const fourDigitsTime = /^([0-1]\d|2[0-3])[0-5]\d$/;
  const fourDigitsTimeOverflow = /^-?(\d{2})[0-5]\d$/;
  const fourDigitsDecimal = /^-?\d{4}$/;
  const threeDigitsTime = /^\d[0-5]\d$/;
  const threeDigitsTimeOverflow = /^-?\d[0-5]\d$/;
  const threeDigitsDecimal = /^-?\d{3}$/;
  const seperatorFirstTime = /^:[0-5]\d?$/;
  const seperatorFirstTimeOverflow = /^-?:[0-5]\d?$/;
  const seperatorFirstDecimal = /^-?,\d\d?$/;

  const valueNumber = parseInt(value.replace(":", ","), 10);

  if (isDecimal) {
    if (value.match(fullFormatDecimal)) {
      return createReturn(value);
    }

    if (value.match(fourDigitsDecimal)) {
      return createReturn(negativeOrPositiveFourDigitsTime(value, delimiter));
    }

    if (value.match(threeDigitsDecimal)) {
      return createReturn(negativeOrPositiveThreeDigitsTime(value, delimiter));
    }

    if (value.match(shortFormatDecimal)) {
      return createReturn(value + "0");
    }

    if (value.match(seperatorFirstDecimal)) {
      if (value[0] === "-" && value.length === 3) {
        return createReturn("-0" + value.slice(1) + "0");
      }

      if (value[0] === "-" && value.length === 4) {
        return createReturn("-0" + value.slice(1));
      }

      if (value.length === 2) {
        return createReturn("0" + value + "0");
      }

      if (value.length === 3) {
        return createReturn("0" + value);
      }
    }
  }

  if (!isDecimal) {
    if (value.match(fullFormatTime)) {
      return createReturn(value.padStart(5, "0"));
    }

    if (value.match(fourDigitsTime)) {
      return createReturn(value.slice(0, 2) + delimiter + value.slice(2));
    }

    if (value.match(threeDigitsTime)) {
      return createReturn("0" + value.slice(0, 1) + delimiter + value.slice(1));
    }

    if (value.match(shortFormatTime)) {
      return createReturn(value.padStart(4, "0") + "0");
    }

    if (value.match(seperatorFirstTime)) {
      if (value.length === 2) {
        return createReturn("00" + value + "0");
      }

      if (value.length === 3) {
        return createReturn("00" + value);
      }
    }

    if (isAllowingOverflow) {
      if (value.match(fullFormatTimeOverflow)) {
        return createReturn(value);
      }

      if (value.match(fourDigitsTimeOverflow)) {
        return createReturn(negativeOrPositiveFourDigitsTime(value, delimiter));
      }

      if (value.match(threeDigitsTimeOverflow)) {
        return createReturn(
          negativeOrPositiveThreeDigitsTime(value, delimiter)
        );
      }

      if (value.match(shortFormatTimeOverflow)) {
        return createReturn(value + "0");
      }

      if (value.match(seperatorFirstTimeOverflow)) {
        if (value[0] === "-" && value.length === 3) {
          return createReturn("-00" + value.slice(1) + "0");
        }

        if (value[0] === "-" && value.length === 4) {
          return createReturn("-00" + value.slice(1));
        }

        if (value.length === 2) {
          return createReturn("00" + value + "0");
        }

        if (value.length === 3) {
          return createReturn("00" + value);
        }
      }
    }
  }

  if (value === "") {
    return createReturn("");
  }

  if (value === "," || value === ":") {
    return createReturn("00" + delimiter + "00");
  }

  if (valueNumber <= 59 && valueNumber >= 0 && value.length <= 2) {
    return createReturn(`00${delimiter}${value.padStart(2, "0")}`);
  }

  if (
    valueNumber >= -59 &&
    valueNumber < 0 &&
    value.length <= 3 &&
    isAllowingOverflow
  ) {
    return createReturn(`-00${delimiter}${value.slice(1).padStart(2, "0")}`);
  }

  return { status: ERROR_WRONG_FORMAT, value };
};

export const diffStartOrEndChanges = (
  startTime: string,
  endTime: string,
  format: formatType = "TIME"
) => {
  const { hours: startHours, minutes: startMinutes } =
    getTimeAsNumber(startTime);
  const { hours: endHours, minutes: endMinutes } = getTimeAsNumber(endTime);
  let hours = endHours - startHours;
  let minutes = endMinutes - startMinutes;
  let isZeroNegative = false;

  if (startHours > endHours && startMinutes > endMinutes) {
    if (minutes < 0) {
      minutes = startMinutes - endMinutes;
    }
  }

  if (startHours > endHours && startMinutes < endMinutes) {
    hours = hours + 1;
    minutes = 60 - minutes;

    if (hours === 0) {
      isZeroNegative = true;
    }
  }

  if (startHours < endHours && startMinutes > endMinutes) {
    hours = hours - 1;
    minutes = 60 + minutes;
  }

  if (startHours === endHours && startMinutes > endMinutes) {
    minutes = startMinutes - endMinutes;
    isZeroNegative = true;
  }

  let hoursString = hours.toString();

  if (isZeroNegative) {
    hoursString = `-${hoursString}`;
  }

  if (hoursString.length === 2 && hoursString[0] === "-") {
    hoursString = `-0${hoursString[1]}`;
  }

  const { value: totalTime } = validateAndSanitizeTimeInput(
    `${hoursString}${minutes.toString().padStart(2, "0")}`,
    format,
    true
  );

  if (format === "DECIMAL") {
    return timeToDecimalFormat(totalTime, format);
  }

  return totalTime;
};

export const calculateEndValueFromTotalChange = (
  totalValue: string,
  startValue: string,
  format: formatType = "TIME"
) => {
  const { hours: totalHours, minutes: totalMinutes } = getTimeAsNumber(
    totalValue,
    format
  );
  const { hours: startHours, minutes: startMinutes } =
    getTimeAsNumber(startValue);
  const isNegative = totalValue.toString()[0] === "-";
  let hours = totalHours + startHours;
  let minutes = totalMinutes + startMinutes;
  let days = 0;

  if (isNegative) {
    minutes = startMinutes - totalMinutes;

    console.log("minutes", minutes);

    if (minutes < 0) {
      hours = hours - 1;
      minutes = 60 + minutes;
    }

    if (hours < 0) {
      const daysWithDecimals = hours / 24;
      console.log(daysWithDecimals);

      days = Math.floor(daysWithDecimals);

      console.log(days, "days");

      const hoursWithDecimals = (daysWithDecimals - days) * 24;
      console.log(hoursWithDecimals);
      hours = Math.round(hoursWithDecimals);
    }
  } else {
    if (minutes > 59) {
      hours = hours + 1;
      minutes = minutes - 60;
    }

    if (hours === 24) {
      days = 1;
      hours = 0;
    }

    if (hours > 24) {
      console.log("here", hours);
      const daysWithDecimals = hours / 24;
      days = Math.floor(daysWithDecimals);

      console.log(days, "days");

      const hoursWithDecimals = (daysWithDecimals - days) * 24;
      console.log(hoursWithDecimals);
      hours = Math.round(hoursWithDecimals);
    }
  }

  console.log(days, hours, minutes);
  const { value: endTime } = validateAndSanitizeTimeInput(
    `${hours.toString().padStart(2, "0")}${minutes
      .toString()
      .padStart(2, "0")}`,
    "TIME"
  );

  return { endTime, days };
};

export const calculateStartValueFromTotalChange = (
  totalValue: string,
  endValue: string,
  format: formatType = "TIME"
) => {
  const { hours: totalHours, minutes: totalMinutes } = getTimeAsNumber(
    totalValue,
    format
  );
  const { hours: endHours, minutes: endMinutes } = getTimeAsNumber(endValue);
  const isNegative = totalValue.toString()[0] === "-";
  let hours = endHours - totalHours;
  let minutes = endMinutes - totalMinutes;
  let days = 0;

  console.log(JSON.stringify({ days, hours, minutes }, null, 2));

  if (!isNegative) {
    minutes = endMinutes - totalMinutes;

    console.log("minutes", minutes);

    if (minutes < 0) {
      hours = hours - 1;
      minutes = 60 + minutes;
    }

    if (hours < 0) {
      const daysWithDecimals = hours / 24;
      console.log(daysWithDecimals);

      days = Math.floor(daysWithDecimals);

      console.log(days, "days");

      const hoursWithDecimals = (daysWithDecimals - days) * 24;
      console.log(hoursWithDecimals);
      hours = Math.round(hoursWithDecimals);
    }
  } else {
    if (minutes > 59) {
      hours = hours + 1;
      minutes = minutes - 60;
    }

    if (hours === 24) {
      days = 1;
      hours = 0;
    }

    if (hours > 24) {
      const daysWithDecimals = hours / 24;
      days = Math.floor(daysWithDecimals);

      const hoursWithDecimals = (daysWithDecimals - days) * 24;
      hours = Math.round(hoursWithDecimals);
    }
  }

  const { value: startTime } = validateAndSanitizeTimeInput(
    `${hours.toString().padStart(2, "0")}${minutes
      .toString()
      .padStart(2, "0")}`,
    "TIME"
  );

  return { startTime, days };
};

export const currentTime = () => {
  const d = new Date(); // for now
  const hours = d.getHours().toString().padStart(2, "0"); // => 09
  const minutes = d.getMinutes().toString().padStart(2, "0"); // =>  30

  return validateAndSanitizeTimeInput(`${hours}${minutes}`, "TIME").value;
};
