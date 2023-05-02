import {
  useState,
  Dispatch,
  SetStateAction,
  useRef,
  FocusEvent,
  ChangeEvent,
} from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";

import {
  validateAndSanitizeTimeInput,
  diffStartOrEndChanges,
  calculateEndValueFromTotalChange,
  calculateStartValueFromTotalChange,
  formatType,
  currentTime,
} from "./helpers";
import { ERROR_WRONG_FORMAT } from "./constants";

import "./styles.scss";

function addDays(date: Date, days: number) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function App() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(startDate);
  const [hasError, setHasError] = useState(false);
  const [format, setFormat] = useState<"DECIMAL" | "TIME">("TIME");
  const [startTime, setStartTime] = useState("");
  const [startTimeIsValid, setStartTimeIsValid] = useState(true);
  const [endTime, setEndTime] = useState("");
  const [endTimeIsValid, setEndTimeIsValid] = useState(true);
  const [totalTime, setTotalTime] = useState("");
  const [totalTimeIsValid, setTotalTimeIsValid] = useState(true);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const totalRef = useRef<HTMLInputElement>(null);
  const correctFormat = format === "DECIMAL" ? "h,mm" : "hh:mm";

  const handleBlur = (
    value: string,
    setValue: Dispatch<SetStateAction<string>>,
    setValidValue: Dispatch<SetStateAction<boolean>>,
    event: FocusEvent
  ) => {
    const { target } = event;
    const startInput = startRef.current;
    const endInput = endRef.current;
    const totalInput = totalRef.current;
    const currentIsStart = target === startInput;
    const currentIsEnd = target === endInput;
    const currentIsTotal = target === totalInput;

    let { value: sanitizedValue, status } = validateAndSanitizeTimeInput(
      value,
      currentIsTotal && format === "DECIMAL" ? "DECIMAL" : "TIME",
      currentIsTotal
    );

    if (status === ERROR_WRONG_FORMAT) {
      setValue(value);
      setValidValue(false);
      setHasError(true);

      return;
    } else {
      setHasError(false);
    }

    setValue(sanitizedValue);
    setValidValue(true);

    if (hasError) {
      return;
    }

    if (currentIsStart) {
      if (endTime !== "") {
        setTotalTime(diffStartOrEndChanges(sanitizedValue, endTime, format));
        // setTotalTimeIsValid(true);
      }
      if (startTime === "") {
        setTotalTime("");
      }
    }

    if (currentIsEnd) {
      if (startTime !== "") {
        setTotalTime(diffStartOrEndChanges(startTime, sanitizedValue, format));
        // setTotalTimeIsValid(true);
      }
      if (endTime === "") {
        setTotalTime("");
      }
    }

    if (currentIsTotal) {
      if (totalTime === "") {
        return false;
      }

      if (startTime !== "" && endTime === "") {
        const { endTime: newEndTime, days: newDays } =
          calculateEndValueFromTotalChange(sanitizedValue, startTime, format);
        setEndTime(newEndTime);
        setEndDate(addDays(startDate, newDays));
      }

      if (
        (startTime === "" && endTime !== "") ||
        (startTime !== "" && endTime !== "")
      ) {
        const { startTime: newStartTime, days: newDays } =
          calculateStartValueFromTotalChange(sanitizedValue, endTime, format);
        setStartTime(newStartTime);
        setStartDate(addDays(startDate, newDays));
      }

      if (startTime === "" && endTime === "") {
        setEndTime(currentTime);
        setStartTime(diffStartOrEndChanges(sanitizedValue, currentTime()));
      }
    }

    setHasError(false);
  };

  const handleFormatChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormat(e.target.value as formatType);

  return (
    <Stack spacing={4}>
      <FormControl>
        <FormLabel id="demo-controlled-radio-buttons-group">
          Time Format
        </FormLabel>
        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={format}
          onChange={handleFormatChange}
        >
          <FormControlLabel
            value="DECIMAL"
            control={<Radio />}
            label="Decimal"
          />
          <FormControlLabel value="TIME" control={<Radio />} label="Time" />
        </RadioGroup>
      </FormControl>

      <Stack spacing={2}>
        <DatePicker onChange={setStartDate} value={startDate} />
        <dl>
          <dt>Start date:</dt>
          <dd>{startDate.toLocaleDateString()}</dd>
          <dt>End date:</dt>
          <dd>{endDate.toLocaleDateString()}</dd>
        </dl>

        <TextField
          inputRef={startRef}
          label="Start time"
          variant="outlined"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          onBlur={(e) =>
            handleBlur(startTime, setStartTime, setStartTimeIsValid, e)
          }
          error={!startTimeIsValid}
          helperText={
            !startTimeIsValid ? `Please use correct format (hh:mm)` : null
          }
          required
        />

        <TextField
          inputRef={endRef}
          label="End time"
          variant="outlined"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          onBlur={(e) => handleBlur(endTime, setEndTime, setEndTimeIsValid, e)}
          error={!endTimeIsValid}
          helperText={
            !endTimeIsValid ? `Please use correct format (hh:mm)` : null
          }
          required
        />

        <TextField
          inputRef={totalRef}
          label="Total hours"
          variant="outlined"
          value={totalTime}
          onChange={(e) => setTotalTime(e.target.value)}
          onBlur={(e) =>
            handleBlur(totalTime, setTotalTime, setTotalTimeIsValid, e)
          }
          error={!totalTimeIsValid}
          helperText={
            !totalTimeIsValid
              ? `Please use correct format (${correctFormat})`
              : null
          }
          required
        />

        <Button
          disabled={hasError}
          variant="contained"
          onClick={() =>
            console.log({
              startDate,
              startTime,
              endDate,
              endTime,
              totalTime,
            })
          }
          size="large"
          endIcon={<SendIcon />}
        >
          Submit
        </Button>
      </Stack>

      <pre>
        {JSON.stringify(
          {
            startDate,
            startTime,
            endDate,
            endTime,
            totalTime,
          },
          null,
          2
        )}
      </pre>
    </Stack>
  );
}
