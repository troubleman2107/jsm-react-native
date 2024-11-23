import React, { useState } from "react";
import { View, Button, Platform, StyleSheet, Text } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

// Define types for our state
type Mode = "date" | "time" | "datetime";

interface DateTimeState {
  date: Date;
  mode: Mode;
  show: boolean;
}

type DatePickerProps = {
  type: Mode;
  isShow?: boolean;
};

const DatePicker = ({ type, isShow = true }: DatePickerProps) => {
  // Initialize state with types
  const [state, setState] = useState<DateTimeState>({
    date: new Date(),
    mode: type,
    show: isShow,
  });

  // Type the event parameter
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || state.date;
    setState((prevState) => ({
      ...prevState,
      date: currentDate,
      show: Platform.OS === "ios",
    }));
  };

  const showMode = (currentMode: Mode) => {
    setState((prevState) => ({
      ...prevState,
      show: true,
      mode: currentMode,
    }));
  };

  const showDatePicker = () => {
    showMode("date");
  };

  const showTimePicker = () => {
    showMode("time");
  };

  return (
    <View>
      {state.show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={state.date}
          mode={state.mode}
          display="spinner"
          onChange={onChange}
          textColor="white"
        />
      )}
    </View>
  );
};

export default DatePicker;
