import {
  getTimeAsNumber,
  timeToDecimalFormat,
  currentTime,
  validateAndSanitizeTimeInput,
  negativeOrPositiveThreeDigitsTime,
  negativeOrPositiveFourDigitsTime,
  diffStartOrEndChanges,
  createReturn,
} from "./helpers";

it("getTimeAsNumber returns object with numbers from time", () => {
  expect(getTimeAsNumber("01:12")).toEqual({ hours: 1, minutes: 12 });
  expect(getTimeAsNumber("23:01")).toEqual({ hours: 23, minutes: 1 });
  expect(getTimeAsNumber("23,01", "DECIMAL")).toEqual({
    hours: 23,
    minutes: 1,
  });
});

it("negativeOrPositiveThreeDigitsTime returns correct formatted time", () => {
  expect(negativeOrPositiveThreeDigitsTime("112", ",")).toEqual("1,12");
  expect(negativeOrPositiveThreeDigitsTime("112", ":")).toEqual("01:12");
  expect(negativeOrPositiveThreeDigitsTime("-112", ",")).toEqual("-1,12");
  expect(negativeOrPositiveThreeDigitsTime("-112", ":")).toEqual("-01:12");
});

it("negativeOrPositiveFourDigitsTime returns correct formatted time", () => {
  expect(negativeOrPositiveFourDigitsTime("1122", ",")).toEqual("11,22");
  expect(negativeOrPositiveFourDigitsTime("1122", ":")).toEqual("11:22");
  expect(negativeOrPositiveFourDigitsTime("-1120", ",")).toEqual("-11,20");
  expect(negativeOrPositiveFourDigitsTime("-1120", ":")).toEqual("-11:20");
});

it("timeToDecimalFormat returns decimal format from time format", () => {
  expect(timeToDecimalFormat("01:12")).toEqual("1,20");
  expect(timeToDecimalFormat("23:01")).toEqual("23,02");
  expect(timeToDecimalFormat("00:00")).toEqual("0,00");
  expect(timeToDecimalFormat("12:30")).toEqual("12,50");
});

describe("currentTime should return system time", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2023-04-20T12:34:56"));
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it("returns true when the date is in the future", () => {
    expect(currentTime()).toBe("12:34");
  });
});

it("validateAndSanitizeTimeInput returns correct format no overflow and time format", () => {
  expect(validateAndSanitizeTimeInput("01:12")).toEqual(createReturn("01:12"));
  expect(validateAndSanitizeTimeInput("1:12")).toEqual(createReturn("01:12"));
  expect(validateAndSanitizeTimeInput(":12")).toEqual(createReturn("00:12"));
  expect(validateAndSanitizeTimeInput("112")).toEqual(createReturn("01:12"));
  expect(validateAndSanitizeTimeInput("11:2")).toEqual(createReturn("11:20"));
  expect(validateAndSanitizeTimeInput("12")).toEqual(createReturn("00:12"));
  expect(validateAndSanitizeTimeInput("2")).toEqual(createReturn("00:02"));
  expect(validateAndSanitizeTimeInput("0")).toEqual(createReturn("00:00"));
  expect(validateAndSanitizeTimeInput("2359")).toEqual(createReturn("23:59"));
  expect(validateAndSanitizeTimeInput("")).toEqual(createReturn(""));
  expect(validateAndSanitizeTimeInput(":")).toEqual(createReturn("00:00"));
  expect(validateAndSanitizeTimeInput(",", "DECIMAL")).toEqual(
    createReturn("00,00")
  );
  expect(validateAndSanitizeTimeInput("0")).toEqual(createReturn("00:00"));
  expect(validateAndSanitizeTimeInput("00")).toEqual(createReturn("00:00"));
  expect(validateAndSanitizeTimeInput("0", "DECIMAL")).toEqual(
    createReturn("00,00")
  );
  expect(validateAndSanitizeTimeInput("00", "DECIMAL")).toEqual(
    createReturn("00,00")
  );
  expect(validateAndSanitizeTimeInput("00", "DECIMAL")).toEqual(
    createReturn("00,00")
  );
  expect(validateAndSanitizeTimeInput("60")).toEqual(createReturn("60", true));
  expect(validateAndSanitizeTimeInput("-1")).toEqual(createReturn("-1", true));
  expect(validateAndSanitizeTimeInput("41561")).toEqual(
    createReturn("41561", true)
  );
  expect(validateAndSanitizeTimeInput("2400")).toEqual(
    createReturn("2400", true)
  );
  expect(validateAndSanitizeTimeInput("2400", "DECIMAL")).toEqual(
    createReturn("24,00")
  );
  expect(validateAndSanitizeTimeInput("-2400", "DECIMAL")).toEqual(
    createReturn("-24,00")
  );
  expect(validateAndSanitizeTimeInput("-56,45", "DECIMAL")).toEqual(
    createReturn("-56,45")
  );
  expect(validateAndSanitizeTimeInput("5668", "DECIMAL")).toEqual(
    createReturn("56,68")
  );
  expect(validateAndSanitizeTimeInput("-5668", "DECIMAL")).toEqual(
    createReturn("-56,68")
  );
  expect(validateAndSanitizeTimeInput("068", "DECIMAL")).toEqual(
    createReturn("0,68")
  );
  expect(validateAndSanitizeTimeInput("668", "DECIMAL")).toEqual(
    createReturn("6,68")
  );
  expect(validateAndSanitizeTimeInput("-668", "DECIMAL")).toEqual(
    createReturn("-6,68")
  );
  expect(validateAndSanitizeTimeInput(",1", "DECIMAL")).toEqual(
    createReturn("0,10")
  );
  expect(validateAndSanitizeTimeInput(",12", "DECIMAL")).toEqual(
    createReturn("0,12")
  );
  expect(validateAndSanitizeTimeInput("-,1", "DECIMAL")).toEqual(
    createReturn("-0,10")
  );
  expect(validateAndSanitizeTimeInput("-,12", "DECIMAL")).toEqual(
    createReturn("-0,12")
  );
  expect(validateAndSanitizeTimeInput("1,1", "DECIMAL")).toEqual(
    createReturn("1,10")
  );
  expect(validateAndSanitizeTimeInput("-1,1", "DECIMAL")).toEqual(
    createReturn("-1,10")
  );
  expect(validateAndSanitizeTimeInput("-9999,1", "DECIMAL")).toEqual(
    createReturn("-9999,10")
  );
  expect(validateAndSanitizeTimeInput("9999,1", "DECIMAL")).toEqual(
    createReturn("9999,10")
  );
  expect(validateAndSanitizeTimeInput("9999:59", "TIME", true)).toEqual(
    createReturn("9999:59")
  );
  expect(validateAndSanitizeTimeInput("-59:25", "TIME", true)).toEqual(
    createReturn("-59:25")
  );
  expect(validateAndSanitizeTimeInput("9999:00", "TIME", true)).toEqual(
    createReturn("9999:00")
  );
  expect(validateAndSanitizeTimeInput("9999:65", "TIME", true)).toEqual(
    createReturn("9999:65", true)
  );
  expect(validateAndSanitizeTimeInput("9959", "TIME", true)).toEqual(
    createReturn("99:59")
  );
  expect(validateAndSanitizeTimeInput("9900", "TIME", true)).toEqual(
    createReturn("99:00")
  );
  expect(validateAndSanitizeTimeInput("-9959", "TIME", true)).toEqual(
    createReturn("-99:59")
  );
  expect(validateAndSanitizeTimeInput("9960", "TIME", true)).toEqual(
    createReturn("9960", true)
  );
  expect(validateAndSanitizeTimeInput("956", "TIME", true)).toEqual(
    createReturn("09:56")
  );
  expect(validateAndSanitizeTimeInput("056", "TIME", true)).toEqual(
    createReturn("00:56")
  );
  expect(validateAndSanitizeTimeInput("-956", "TIME", true)).toEqual(
    createReturn("-09:56")
  );
  expect(validateAndSanitizeTimeInput("996", "TIME", true)).toEqual(
    createReturn("996", true)
  );
  expect(validateAndSanitizeTimeInput("24:5", "TIME", true)).toEqual(
    createReturn("24:50")
  );
  expect(validateAndSanitizeTimeInput("999:2", "TIME", true)).toEqual(
    createReturn("999:20")
  );
  expect(validateAndSanitizeTimeInput("-54:3", "TIME", true)).toEqual(
    createReturn("-54:30")
  );
  expect(validateAndSanitizeTimeInput("-54:6", "TIME", true)).toEqual(
    createReturn("-54:6", true)
  );
  expect(validateAndSanitizeTimeInput(":3", "TIME", true)).toEqual(
    createReturn("00:30")
  );
  expect(validateAndSanitizeTimeInput(":32", "TIME", true)).toEqual(
    createReturn("00:32")
  );
  expect(validateAndSanitizeTimeInput("-:32", "TIME", true)).toEqual(
    createReturn("-00:32")
  );
  expect(validateAndSanitizeTimeInput("-:3", "TIME", true)).toEqual(
    createReturn("-00:30")
  );
  expect(validateAndSanitizeTimeInput("-:6", "TIME", true)).toEqual(
    createReturn("-:6", true)
  );
  expect(validateAndSanitizeTimeInput("-59", "TIME", true)).toEqual(
    createReturn("-00:59")
  );
});

it("calculates correct total time from start and end times", () => {
  expect(diffStartOrEndChanges("00:00", "22:30")).toEqual("22:30");
  expect(diffStartOrEndChanges("22:00", "22:30")).toEqual("00:30");
  expect(diffStartOrEndChanges("10:00", "19:45")).toEqual("09:45");
  expect(diffStartOrEndChanges("10:00", "19:45", "DECIMAL")).toEqual("9,75");
  expect(diffStartOrEndChanges("10:00", "19:10", "DECIMAL")).toEqual("9,17");
  expect(diffStartOrEndChanges("19:00", "10:00")).toEqual("-09:00");
  expect(diffStartOrEndChanges("19:45", "10:00")).toEqual("-09:45");
  expect(diffStartOrEndChanges("19:45", "10:25")).toEqual("-09:20");
  expect(diffStartOrEndChanges("19:25", "10:45")).toEqual("-08:40");
});
