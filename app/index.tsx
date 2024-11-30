import React, { useEffect, useState, useRef, Children } from "react";
import {
  View,
  Text,
  Button,
  Platform,
  FlatList,
  AppRegistry,
} from "react-native";
import notifee, {
  AndroidImportance,
  EventType,
  IntervalTrigger,
  RepeatFrequency,
  TimestampTrigger,
  TimeUnit,
  TriggerType,
} from "@notifee/react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import Home, { WakeTimeProps } from "./(tabs)/home";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import BackgroundTimer from "react-native-background-timer";

// async function unregisterBackgroundFetchAsync() {
//   return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
// }

const App: React.FC = () => {
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const timeCheckRef = useRef<NodeJS.Timeout | null>(null);
  const alarmRef = useRef<NodeJS.Timeout | null>(null);
  const [alarms, setAlarms] = useState<(Date | undefined)[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState<Date>(new Date());
  const [sleepTime, setSleepTime] = useState<Date>();
  const [cycleTime, setCycleTime] = useState<WakeTimeProps[]>([]);

  // useEffect(() => {
  //   // Start a background timer
  //   BackgroundTimer.start();
  //   const interval = setInterval(() => {
  //     console.log("background");
  //   }, 1000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  useEffect(() => {
    const requestPermissions = async () => {
      if (!permissionsRequested) {
        await notifee.requestPermission();
        setPermissionsRequested(true);
      }
    };
    requestPermissions();

    // Set up time check for all alarms
  }, [permissionsRequested, alarms]);

  useEffect(() => {
    const checkAlarmTimes = () => {
      if (alarmRef.current) {
        clearInterval(alarmRef.current);
      }

      const now = new Date();
      alarms.forEach((alarmTime) => {
        if (
          now.getHours() === alarmTime?.getHours() &&
          now.getMinutes() === alarmTime?.getMinutes()
        ) {
          if (timeCheckRef.current) {
            clearInterval(timeCheckRef.current);
          }
          BackgroundTimer.start();
          alarmRef.current = setInterval(() => {
            scheduleRepeatingNotification(alarmTime);
          }, 1000);
        }
      });
    };

    timeCheckRef.current = setInterval(checkAlarmTimes, 1000);

    return () => {
      if (timeCheckRef.current) {
        clearInterval(timeCheckRef.current);
      }

      if (alarmRef.current) {
        clearInterval(alarmRef.current);
      }
    };
  }, [alarms]);

  useEffect(() => {
    if (sleepTime) calculateSleepCycles(sleepTime);
  }, [sleepTime]);

  useEffect(() => {
    if (cycleTime) {
      const activeAlarm = cycleTime
        .filter((item) => item.alarm)
        .map((item) => {
          return item.timeRaw;
        });
      if (activeAlarm.length > 0) setAlarms(activeAlarm);
    }
  }, [cycleTime]);

  const scheduleRepeatingNotification = async (alarmTime: Date) => {
    console.log(
      "alarmNow",
      `${new Date()?.getHours()} : ${new Date()?.getMinutes()} : ${new Date()?.getSeconds()}`
    );
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
        body: `Alarm triggered at ${alarmTime?.toLocaleTimeString()} 🔔`,
        android: {
          channelId: "default",
          sound: "default",
        },
        ios: {
          sound: "default",
        },
      });

      // const trigger: IntervalTrigger = {
      //   type: TriggerType.INTERVAL,
      //   timeUnit: TimeUnit.MINUTES,
      //   interval: 15,
      // };

      // // Schedule the notification
      // await notifee.createTriggerNotification(
      //   {
      //     title: "Alarm Notification",
      //     body: `Alarm set for ${alarmTime.toLocaleTimeString()} 🔔`,
      //     android: {
      //       channelId: "default",
      //       sound: "default",
      //     },
      //     ios: {
      //       sound: "default",
      //     },
      //   },
      //   trigger
      // );
    } catch (error) {
      console.error("Failed to schedule notification", error);
    }
  };

  const clearSpecificAlarm = async (index?: number) => {
    // unregisterBackgroundFetchAsync();
    //Clear alarm, and cancel all notification
    BackgroundTimer.stop();

    setAlarms([]);
    if (timeCheckRef.current) {
      clearInterval(timeCheckRef.current);
    }

    if (alarmRef.current) clearInterval(alarmRef.current);

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
    const cycleDuration = 90; // minutes per cycle

    for (let i = 0; i < 6; i++) {
      const cycleTime = new Date(
        startTime.getTime() + (i + 1) * cycleDuration * 1.1 * 1000
      );

      sleepCycles.push({
        timeRaw: cycleTime,
        time: cycleTime.toLocaleString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        cycles: i + 1,
        hours: ((i + 1) * 1.5).toFixed(1),
        colorClass: colorClasses[i],
        alarm: false,
      });
    }

    setCycleTime(sleepCycles);

    return sleepCycles;
  }

  const handleAlarm = (time: Date | undefined, id: number) => {
    if (time) {
      const activeAlarm = cycleTime.map((item, index) => {
        if (index === id && !item.alarm) {
          item.alarm = true;
        } else {
          item.alarm = false;
        }
        return item;
      });

      setCycleTime(activeAlarm);
    }
  };

  return (
    <View className="flex flex-1 items-center justify-center p-8 bg-[#0f0817]">
      <DateTimePicker
        testID="dateTimePicker"
        value={newAlarmTime}
        mode="time"
        display="spinner"
        onChange={onChangeDate}
        textColor="#ffffff"
      />
      <CustomButton
        handlePress={() => {
          setSleepTime(newAlarmTime);
        }}
        title="Sleep"
        containerStyles="w-full"
      />
      {cycleTime.length > 0 && (
        <>
          <Home cycleTime={cycleTime} handleAlarm={handleAlarm} />
          <CustomButton
            handlePress={clearSpecificAlarm}
            title="Clear"
            containerStyles="w-full"
          />
        </>
      )}
    </View>
  );
};

export default App;
