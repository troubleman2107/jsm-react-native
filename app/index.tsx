import React, { useEffect, useState, useRef, Children, useMemo } from "react";
import {
  View,
  Platform,
  FlatList,
  Text,
  Switch,
  SafeAreaView,
  ScrollView,
} from "react-native";
import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import CustomButton from "@/components/CustomButton";
import { router, useNavigation } from "expo-router";
import Home, { WakeTimeProps } from "./(tabs)/home";
import BackgroundTimer from "react-native-background-timer";
import Sound from "react-native-sound";
import { Power } from "lucide-react-native";
import { Icon } from "react-native-elements";
import { navigate } from "expo-router/build/global-state/routing";

type AlarmType = {
  active: boolean;
  time: Date;
  isAlarm?: boolean;
};

type AlarmsType = AlarmType[];

Sound.setCategory("Playback");
Sound.setMode("Default");

const App: React.FC = () => {
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const timeCheckRef = useRef<NodeJS.Timeout | null>(null);
  const alarmRef = useRef<NodeJS.Timeout | null>(null);
  const [alarms, setAlarms] = useState<AlarmsType>([]);
  const [newAlarmTime, setNewAlarmTime] = useState<Date>(new Date());
  const [cycleTime, setCycleTime] = useState<WakeTimeProps[]>([]);
  const [isAlarm, setIsAlarm] = useState<boolean>(false);
  const [idAlarm, setIdAlarm] = useState<number>();
  const [isCycle, setIsCycle] = useState<boolean>(true);

  console.log("🚀 ~ newAlarmTime:", newAlarmTime);

  const soundRef = useRef<Sound | null>(null);

  const playSound = () => {
    if (soundRef.current) {
      soundRef.current.setVolume(1);
    }
  };

  const stopSound = () => {
    if (soundRef.current) {
      soundRef.current.stop(() => {
        console.log("Sound has been stopped.");
      });
    } else {
      console.warn("No sound instance to stop.");
    }
  };

  useEffect(() => {
    setAlarms([]);
    setCycleTime([]);
    BackgroundTimer.stopBackgroundTimer();
  }, [isCycle]);

  useEffect(() => {
    const requestPermissions = async () => {
      if (!permissionsRequested) {
        await notifee.requestPermission();
        setPermissionsRequested(true);
      }
      requestPermissions();
    };

    // Set up time check for all alarms
  }, [permissionsRequested, alarms]);

  useEffect(() => {
    const checkAlarmTimes = () => {
      console.log(
        "alarmNow",
        `${new Date()?.getHours()} : ${new Date()?.getMinutes()} : ${new Date()?.getSeconds()}`
      );

      if (alarmRef.current) {
        clearInterval(alarmRef.current);
      }

      const now = new Date();
      alarms?.forEach((alarmTime, alarmIndex) => {
        if (alarmTime.active) {
          if (
            now.getHours() === alarmTime?.time?.getHours() &&
            now.getMinutes() === alarmTime?.time?.getMinutes()
          ) {
            setIdAlarm(alarmIndex);
            setIsAlarm(true);
            if (timeCheckRef.current) {
              clearInterval(timeCheckRef.current);
            }

            alarmRef.current = setInterval(() => {
              playSound();
              scheduleRepeatingNotification(alarmTime?.time);
            }, 1000);
          }
        }
      });
    };

    if (alarms.length > 0 && alarms.find((item) => item.active)) {
      // BackgroundTimer.start();
      if (soundRef && !soundRef.current?.isLoaded()) {
        soundRef.current = new Sound(
          "alarm2.mp3",
          Sound.MAIN_BUNDLE,
          (error) => {
            if (error) {
              console.error("Failed to load sound", error);
              return;
            }
            // Play the sound
            BackgroundTimer.runBackgroundTimer(() => {
              checkAlarmTimes();
              if (soundRef.current) {
                soundRef.current.play((success) => {
                  if (!success) {
                    console.error(
                      "Sound playback failed due to audio decoding errors."
                    );
                  }
                  console.log("play sound success");
                });
                soundRef.current.setNumberOfLoops(-1);
              }
            }, 1000);
            if (soundRef.current) {
              soundRef.current.setVolume(0);
            }
          }
        );
      }
    } else if (alarms.find((item) => !item.active)) {
      console.log("stop background !");
      BackgroundTimer.stopBackgroundTimer();
      // BackgroundTimer.stop();
    }

    return () => {
      if (timeCheckRef.current) {
        clearInterval(timeCheckRef.current);
      }

      if (alarmRef.current) {
        clearInterval(alarmRef.current);
      }

      if (soundRef.current) {
        soundRef.current.release();
      }
    };
  }, [alarms]);

  useEffect(() => {
    console.log("cycleTime", cycleTime);
    if (cycleTime) {
      const activeAlarm = cycleTime
        .filter((item) => item.alarm)
        .map((item) => {
          return item.timeRaw;
        })
        .map((time) => ({
          time: time,
          active: true,
          isAlarm: false,
        }));

      if (activeAlarm.length > 0) {
        for (let i = 1; i <= 4; i++) {
          const nextTime = new Date(
            activeAlarm[0]?.time?.getTime() + i * 5 * 60 * 1000
          ); // 5 minutes = 5 * 60 * 1000 milliseconds
          activeAlarm.push({
            time: nextTime,
            active: false,
            isAlarm: false,
          });
        }
      }

      if (activeAlarm.length > 0) setAlarms(activeAlarm);
    }
  }, [cycleTime]);

  const scheduleRepeatingNotification = async (alarmTime: Date | undefined) => {
    console.log("notifee");
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
    } catch (error) {
      console.error("Failed to schedule notification", error);
    }
  };

  const clearSpecificAlarm = async (index?: number) => {
    // unregisterBackgroundFetchAsync();
    //Clear alarm, and cancel all notification
    BackgroundTimer.stopBackgroundTimer();
    stopSound();
    setIsAlarm(false);
    const removeAlarms = alarms.filter((_, indexAlarm) => indexAlarm !== index);
    setAlarms(removeAlarms);

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

    if (!isCycle) {
      setCycleTime([
        {
          timeRaw: newAlarmTime,
          time: newAlarmTime.toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          alarm: true,
          colorClass: colorClasses[4],
        },
      ]);

      return;
    }

    // Generate sleep cycles
    const sleepCycles = [];
    const cycleDuration = 90; // minutes per cycle

    for (let i = 0; i < 6; i++) {
      const cycleTime = new Date(
        startTime.getTime() +
          (i + 1) * cycleDuration * 60 * 1000 +
          15 * 60 * 1000
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

  const handleAlarm = (time: Date, id: number) => {
    BackgroundTimer.stopBackgroundTimer();
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

  // async function onCreateTriggerNotification() {
  //   console.log("trigger !");
  //   const date = new Date(Date.now());
  //   date.setHours(12);
  //   date.setMinutes(0);

  //   // Create a time-based trigger
  //   const trigger: TimestampTrigger = {
  //     type: TriggerType.TIMESTAMP,
  //     timestamp: newAlarmTime.getTime(), // fire at 11:10am (10 minutes before meeting)
  //   };

  //   // Create a trigger notification
  //   await notifee.createTriggerNotification(
  //     {
  //       title: "Meeting with Jane",
  //       body: "Today at 11:20am",
  //       android: {
  //         channelId: "your-channel-id",
  //       },
  //       ios: {
  //         sound: "default",
  //       },
  //     },
  //     trigger
  //   );
  // }

  // async function handleTriggerNotifi() {
  //   onCreateTriggerNotification();
  //   onCreateTriggerNotification();
  //   onCreateTriggerNotification();
  //   onCreateTriggerNotification();
  //   onCreateTriggerNotification();
  //   onCreateTriggerNotification();
  // }

  const navigation = useNavigation();

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
          calculateSleepCycles(newAlarmTime);
        }}
        title={`${isCycle ? "Sleep 💤" : "Wake Up 🌞"}`}
        containerStyles="w-full h-[60px]"
      />
      <View className="flex flex-row justify-between items-center mt-5 w-[110px]">
        <Text className="text-white text-2xl">Cycle</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#FF9C01" }}
          // thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#0f0817"
          onValueChange={() => {
            setIsCycle(!isCycle);
          }}
          value={isCycle}
        />
      </View>
      {cycleTime.length > 0 && isCycle && (
        <>
          <Home cycleTime={cycleTime} handleAlarm={handleAlarm} />
        </>
      )}
      {cycleTime.length > 0 && (
        <View>
          <FlatList
            className={`flex-grow-0 ${isCycle ? "h-[25vh]" : "mt-5"}`}
            data={alarms}
            renderItem={({ item, index }) => (
              <View className="flex flex-row justify-between items-center w-full bg-white/10 backdrop-blur-sm mt-2 rounded-2xl p-4 shadow-slate-200">
                <Text className="text-white text-3xl">{`${item.time.toLocaleTimeString(
                  "en-US",
                  { hour: "2-digit", minute: "2-digit", hour12: false }
                )}`}</Text>
                <View className="flex flex-row justify-between items-center gap-3">
                  <Switch
                    trackColor={{ false: "#767577", true: "#FF9C01" }}
                    // thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#0f0817"
                    onValueChange={() => {
                      BackgroundTimer.stopBackgroundTimer();
                      const newAlarm = alarms.map((itemNew, indexNew) => {
                        if (index === indexNew) {
                          itemNew.active = !item.active;
                        }
                        return itemNew;
                      });
                      setAlarms(newAlarm);
                    }}
                    value={item.active ? true : false}
                  />
                  {isAlarm && item.active && index === idAlarm && (
                    <CustomButton
                      handlePress={() => clearSpecificAlarm(index)}
                      title="Stop"
                      containerStyles="w-[75px] p-2"
                    />
                  )}
                </View>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default App;
