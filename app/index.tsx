import React, { useEffect, useState, useRef, Children, useMemo } from "react";
import { View, Platform, FlatList, Text, Switch } from "react-native";
import notifee, { AndroidImportance } from "@notifee/react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import Home, { WakeTimeProps } from "./(tabs)/home";
import BackgroundTimer from "react-native-background-timer";
import Sound from "react-native-sound";
import { Power } from "lucide-react-native";
import { Icon } from "react-native-elements";

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
  const [sleepTime, setSleepTime] = useState<Date>();
  const [cycleTime, setCycleTime] = useState<WakeTimeProps[]>([]);
  const [isAlarm, setIsAlarm] = useState<boolean>(false);
  const [idAlarm, setIdAlarm] = useState<number>();
  console.log("🚀 ~ idAlarm:", idAlarm);

  const soundRef = useRef<Sound | null>(null);

  console.log("alarms", alarms);

  const prepareSound = () => {
    if (soundRef && !soundRef.current?.isLoaded()) {
      soundRef.current = new Sound("alarm2.mp3", Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error("Failed to load sound", error);
          return;
        }
        // Play the sound
        // BackgroundTimer.runBackgroundTimer(() => {
        if (soundRef.current) {
          soundRef.current.play((success) => {
            console.log("🚀 ~ soundRef.current.play ~ success:", success);
            if (!success) {
              console.error(
                "Sound playback failed due to audio decoding errors."
              );
            }
          });
          soundRef.current.setVolume(0);
          soundRef.current.setNumberOfLoops(-1);
        }
        // }, 1000);
      });
    }
  };

  const playSound = () => {
    if (soundRef.current) {
      console.log("🚀 ~ playSound ~ soundRef.current:", soundRef.current);
      soundRef.current.setVolume(1);
      // soundRef.current.setVolume(1);
      // soundRef.current = new Sound("alarm2.mp3", Sound.MAIN_BUNDLE, (error) => {
      //   if (error) {
      //     console.error("Failed to load sound", error);
      //     return;
      //   }
      //   // Play the sound
      //   if (soundRef.current) {
      //     soundRef.current.play((success) => {
      //       if (!success) {
      //         console.error(
      //           "Sound playback failed due to audio decoding errors."
      //         );
      //       }
      //     });
      //   }
      // });
    }
  };

  // useEffect(() => {
  //   prepareSound();
  // }, []);

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
            // updateIsAlarm(alarms, alarmIndex);
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

    console.log("alarm2", alarms);

    if (alarms.length > 0 && alarms.find((item) => item.active)) {
      // BackgroundTimer.start();
      if (soundRef && !soundRef.current?.isLoaded()) {
        console.log("prepare success");
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
                  console.log("🚀 ~ soundRef.current.play ~ success:", success);
                  if (!success) {
                    console.error(
                      "Sound playback failed due to audio decoding errors."
                    );
                  }
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
    if (sleepTime) calculateSleepCycles(sleepTime);
  }, [sleepTime]);

  useEffect(() => {
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

      console.log("🚀 ~ useEffect ~ activeAlarm:", activeAlarm);

      if (activeAlarm.length > 0) setAlarms(activeAlarm);
    }
  }, [cycleTime]);

  const updateIsAlarm = (alarms: AlarmsType, indexAlarms: number) => {
    const newUpdate = alarms.map((item, index) => {
      if (index === indexAlarms) {
        item.isAlarm = true;
      }
      return item;
    });

    setAlarms(newUpdate);
  };

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
    console.log("🚀 ~ clearSpecificAlarm ~ removeAlarms:", removeAlarms);
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

  const handleAlarm = (time: Date, id: number) => {
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
        containerStyles="w-full h-[60px]"
      />
      {cycleTime.length > 0 && (
        <>
          <Home cycleTime={cycleTime} handleAlarm={handleAlarm} />
          {/* {isAlarm && (
            <CustomButton
              handlePress={clearSpecificAlarm}
              title="Clear"
              containerStyles="w-full"
            />
          )} */}
        </>
      )}
      <View>
        <FlatList
          className="flex-grow-0 h-[30vh]"
          data={alarms}
          renderItem={({ item, index }) => (
            <View className="flex flex-row justify-between items-center w-full">
              <Text className="text-white text-3xl mb-4">{`${item.time.toLocaleTimeString()}`}</Text>
              <View className="flex flex-row justify-between items-center gap-3">
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  // thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => {
                    BackgroundTimer.stopBackgroundTimer();
                    console.log("toggle");
                    const newAlarm = alarms.map((itemNew, indexNew) => {
                      if (index === indexNew) {
                        itemNew.active = !item.active;
                      }
                      return itemNew;
                    });
                    setAlarms(newAlarm);
                    // setAlarms((prevState) => {
                    //   prevState.map((item) => {

                    //   })
                    // })
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
    </View>
  );
};

export default App;
