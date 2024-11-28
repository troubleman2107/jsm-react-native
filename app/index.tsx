import React, { useEffect, useState, useRef, Children } from "react";
import { View, Text, Button, Platform, FlatList } from "react-native";
import notifee, { AndroidImportance } from "@notifee/react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";

const App: React.FC = () => {
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const timeCheckRef = useRef<NodeJS.Timeout | null>(null);
  const [alarms, setAlarms] = useState<Date[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState<Date>(new Date());
  console.log("🚀 ~ newAlarmTime:", newAlarmTime);
  const [cycleSleep, setCycleSleep] = useState<
    { time: string; cycles: number; hours: string; colorClass: string }[]
  >([]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (!permissionsRequested) {
        await notifee.requestPermission();
        setPermissionsRequested(true);
      }
    };
    requestPermissions();
  }, [permissionsRequested]);

  useEffect(() => {
    // Clear previous interval
    if (timeCheckRef.current) {
      clearTimeout(timeCheckRef.current);
    }

    // Only set up checking if alarms exist
    if (alarms.length > 0) {
      const checkNextAlarm = () => {
        const now = new Date();
        alarms.forEach((alarmTime) => {
          if (
            now.getHours() === alarmTime.getHours() &&
            now.getMinutes() === alarmTime.getMinutes()
          ) {
            scheduleRepeatingNotification(alarmTime);
          }
        });

        // Schedule next check
        timeCheckRef.current = setTimeout(checkNextAlarm, 1000);
      };

      calculateSleepCycles(alarms[0]);
      // Initial check
      checkNextAlarm();
    }

    // Cleanup function
    return () => {
      if (timeCheckRef.current) {
        clearTimeout(timeCheckRef.current);
      }
    };
  }, [alarms]);

  const scheduleRepeatingNotification = async (alarmTime: Date) => {
    console.log("notifi");
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
    const updatedAlarms = alarms.filter((_, i) => i !== index);
    setAlarms(updatedAlarms);
    //Clear alarm, and cancel all notification
    await notifee.cancelAllNotifications();
  };

  const onChangeDate = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    const currentDate = selectedDate || newAlarmTime;
    setNewAlarmTime(currentDate);
  };

  function calculateSleepCycles(inputDate: Date) {
    // Create a Date object from the input
    const startTime = new Date(inputDate);

    // Define color classes based on cycle progression
    const colorClasses = [
      "text-[#ff6b6b]", // First two cycles (red)
      "text-[#ff6b6b]",
      "text-[#ffd93d]", // Next two cycles (yellow)
      "text-[#ffd93d]",
      "text-[#6bff84]", // Last two cycles (green)
      "text-[#6bff84]",
    ];

    // Generate sleep cycles
    const sleepCycles = [];

    for (let i = 0; i < 6; i++) {
      // Calculate time for each cycle (90 minutes apart)
      // const cycleTime = new Date(startTime.getTime() + i * 90 * 60 * 1000);
      const spreadTime = startTime;

      console.log("spreadTime", spreadTime.getHours(), spreadTime.getMinutes());
      spreadTime.setMinutes(spreadTime.getMinutes() + 90);
      console.log("output", spreadTime.getHours(), spreadTime.getMinutes());

      // Format time in 12-hour format
      const formattedTime = spreadTime.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      sleepCycles.push({
        time: formattedTime,
        cycles: i + 1,
        hours: ((i + 1) * 1.5).toFixed(1),
        colorClass: colorClasses[i],
      });
    }

    setCycleSleep(cycleSleep);

    return sleepCycles;
  }

  console.log(cycleSleep);

  return (
    <View className="flex flex-1 items-center justify-center p-8">
      <DateTimePicker
        testID="dateTimePicker"
        value={newAlarmTime}
        mode="time"
        display="spinner"
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
      <CustomButton
        handlePress={() => {
          router.push("/home");
        }}
        title="Go to alarm"
        containerStyles="w-full mt-7"
      />
    </View>
  );
};

export default App;
