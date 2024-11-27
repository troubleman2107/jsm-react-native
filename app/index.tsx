import React, { useEffect, useState, useRef } from "react";
import { View, Text, Button, Platform, FlatList } from "react-native";
import notifee, { AndroidImportance } from "@notifee/react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

const App: React.FC = () => {
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeCheckRef = useRef<NodeJS.Timeout | null>(null);
  const [alarms, setAlarms] = useState<Date[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState<Date>(new Date());

  useEffect(() => {
    const requestPermissions = async () => {
      if (!permissionsRequested) {
        await notifee.requestPermission();
        setPermissionsRequested(true);
      }
    };
    requestPermissions();

    // Set up time check for all alarms
    timeCheckRef.current = setInterval(checkAlarmTimes, 1000);

    return () => {
      if (timeCheckRef.current) {
        clearInterval(timeCheckRef.current);
      }
    };
  }, [permissionsRequested, alarms]);

  const checkAlarmTimes = () => {
    const now = new Date();
    alarms.forEach((alarmTime) => {
      if (
        now.getHours() === alarmTime.getHours() &&
        now.getMinutes() === alarmTime.getMinutes()
      ) {
        scheduleRepeatingNotification(alarmTime);
      }
    });
  };

  const scheduleRepeatingNotification = async (alarmTime: Date) => {
    try {
      if (Platform.OS === "android") {
        await notifee.createChannel({
          id: "default",
          name: "Default Channel",
          importance: AndroidImportance.HIGH,
          sound: "default",
        });
      }

      await notifee.displayNotification({
        title: "Alarm Notification",
        body: `Alarm triggered at ${alarmTime.toLocaleTimeString()} 🔔`,
        android: {
          channelId: "default",
          sound: "default",
        },
        ios: {
          sound: "default",
        },
      });
    } catch (error) {
      console.error("Failed to schedule notification", error);
    }
  };

  const addAlarm = () => {
    const isDuplicate = alarms.some(
      (alarm) =>
        alarm.getHours() === newAlarmTime.getHours() &&
        alarm.getMinutes() === newAlarmTime.getMinutes()
    );

    if (!isDuplicate) {
      setAlarms([...alarms, new Date(newAlarmTime)]);
    }
  };

  const clearSpecificAlarm = async (index: number) => {
    // Remove the specific alarm
    const updatedAlarms = alarms.filter((_, i) => i !== index);
    setAlarms(updatedAlarms);

    // Cancel notification for this specific time
    await notifee.cancelAllNotifications();
  };

  const onChangeDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    const currentDate = selectedDate || newAlarmTime;
    setNewAlarmTime(currentDate);
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <DateTimePicker
        testID="dateTimePicker"
        value={newAlarmTime}
        mode="time"
        display="spinner"
        is24Hour={true}
        onChange={onChangeDate}
      />
      <Button title="Add Alarm" onPress={addAlarm} />
      <FlatList
        data={alarms}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginVertical: 10,
            }}
          >
            <Text>{item.toLocaleTimeString()}</Text>
            <Button
              title="Clear"
              color="red"
              onPress={() => clearSpecificAlarm(index)}
            />
          </View>
        )}
      />
    </View>
  );
};

export default App;
