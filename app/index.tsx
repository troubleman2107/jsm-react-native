import React, { useEffect, useState, useRef } from "react";
import { View, Text, Button, Platform } from "react-native";
import notifee, { AndroidImportance } from "@notifee/react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

const App: React.FC = () => {
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeCheckRef = useRef<NodeJS.Timeout | null>(null);
  const [date, setDate] = useState<Date>(new Date(1598051730000));

  useEffect(() => {
    // Request permissions when the app starts
    const requestPermissions = async () => {
      if (!permissionsRequested) {
        await notifee.requestPermission();
        setPermissionsRequested(true);
      }
    };
    requestPermissions();
  }, [permissionsRequested]);

  const setNotification = () => {
    function triggerFunction() {
      // Remove the isNotificationRunning check
      if (timeCheckRef.current) {
        clearInterval(timeCheckRef.current);
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Start a new interval
      intervalRef.current = setInterval(() => {
        // Directly call the async function to schedule notification
        scheduleRepeatingNotification();
      }, 3000);
    }

    // Set up an interval to check the time every second
    timeCheckRef.current = setInterval(() => {
      const now = new Date();
      // Check if current time matches your desired time (12:17 in this example)
      if (
        now.getHours() === date.getHours() &&
        now.getMinutes() === date.getMinutes()
      ) {
        triggerFunction();
      }
    }, 1000);
  };

  const scheduleRepeatingNotification = async () => {
    try {
      // Create a channel for Android
      if (Platform.OS === "android") {
        await notifee.createChannel({
          id: "default",
          name: "Default Channel",
          importance: AndroidImportance.HIGH,
          sound: "default",
        });
      }

      // Trigger an immediate notification
      await notifee.displayNotification({
        title: "Immediate Notification",
        body: `Notification at ${new Date().toLocaleTimeString()} 🐈‍⬛`,
        android: {
          channelId: "default",
          sound: "default",
        },
        ios: {
          sound: "default",
        },
      });

      console.log("Notification scheduled at", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Failed to schedule notification", error);
    }
  };

  const cancelNotification = async () => {
    console.log("Clearing notification");

    // Stop the time check interval
    if (timeCheckRef.current) {
      clearInterval(timeCheckRef.current);
      timeCheckRef.current = null;
    }

    // Stop the notification interval
    if (intervalRef.current) {
      console.log("clear interval", intervalRef.current);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Optional: Cancel all displayed notifications
    await notifee.cancelAllNotifications();
  };

  const onChangeDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    const currentDate = selectedDate;
    if (currentDate) setDate(currentDate);
  };

  console.log(date.getHours(), date.getMinutes());

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* <Text>Immediate and Repeating Notification Example</Text> */}
      <DateTimePicker
        testID="dateTimePicker"
        value={date}
        mode={"time"}
        display="spinner"
        is24Hour={true}
        // minuteInterval={5}
        onChange={onChangeDate}
      />
      <Button title="Sleep" onPress={setNotification} />
      <Button
        title="Cancel Notification"
        onPress={cancelNotification}
        color="red"
      />
    </View>
  );
};

export default App;
