// AlarmClock.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
} from "react-native";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKGROUND_FETCH_TASK = "background-alarm-task";
const ALARM_STORAGE_KEY = "@alarm_time";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log("defined task");
  try {
    const storedAlarmTime = await AsyncStorage.getItem(ALARM_STORAGE_KEY);
    console.log(
      "🚀 ~ TaskManager.defineTask ~ storedAlarmTime:",
      storedAlarmTime
    );
    if (!storedAlarmTime) return BackgroundFetch.BackgroundFetchResult.NoData;

    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, "0");
    const currentMinutes = now.getMinutes().toString().padStart(2, "0");
    const currentTimeString = `${currentHours}:${currentMinutes}`;

    console.log(
      "🚀 ~ TaskManager.defineTask ~ storedAlarmTime:",
      storedAlarmTime
    );
    console.log(
      "🚀 ~ TaskManager.defineTask ~ currentTimeString:",
      currentTimeString
    );
    console.log(
      "storedAlarmTime === currentTimeString",
      currentTimeString === storedAlarmTime
    );

    if (currentTimeString === storedAlarmTime) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Alarm!",
          body: "Your alarm is ringing!",
          sound: true,
          priority: "high",
          vibrate: [0, 250, 250, 250],
        },
        trigger: null,
      });
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }
});

const AlarmClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmTime, setAlarmTime] = useState("");
  const [isAlarmSet, setIsAlarmSet] = useState(false);

  // Request notification permissions
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // Initialize background fetch
  useEffect(() => {
    initializeBackgroundFetch();
  }, []);

  // Load saved alarm time
  useEffect(() => {
    loadAlarmTime();
  }, []);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("alarm", {
        name: "Alarm",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
  };

  const initializeBackgroundFetch = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60, // 1 minute
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("Task Register success !");
    } catch (err) {
      console.log("Task Register failed:", err);
    }
  };

  const loadAlarmTime = async () => {
    try {
      const savedAlarmTime = await AsyncStorage.getItem(ALARM_STORAGE_KEY);
      if (savedAlarmTime) {
        setAlarmTime(savedAlarmTime);
        setIsAlarmSet(true);
      }
    } catch (error) {
      console.error("Error loading alarm time:", error);
    }
  };

  const handleSetAlarm = async () => {
    if (alarmTime) {
      try {
        await AsyncStorage.setItem(ALARM_STORAGE_KEY, alarmTime);
        setIsAlarmSet(true);
        alert("Alarm set successfully!");
      } catch (error) {
        console.error("Error saving alarm time:", error);
        alert("Failed to set alarm");
      }
    }
  };

  const handleCancelAlarm = async () => {
    try {
      await AsyncStorage.removeItem(ALARM_STORAGE_KEY);
      setIsAlarmSet(false);
      setAlarmTime("");
      alert("Alarm cancelled");
    } catch (error) {
      console.error("Error cancelling alarm:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.currentTime}>{currentTime.toLocaleTimeString()}</Text>

      <View style={styles.alarmContainer}>
        <TextInput
          style={styles.input}
          placeholder="Set alarm (HH:MM)"
          value={alarmTime}
          onChangeText={setAlarmTime}
          keyboardType="numbers-and-punctuation"
          editable={!isAlarmSet}
        />

        {!isAlarmSet ? (
          <TouchableOpacity style={styles.button} onPress={handleSetAlarm}>
            <Text style={styles.buttonText}>Set Alarm</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancelAlarm}
          >
            <Text style={styles.buttonText}>Cancel Alarm</Text>
          </TouchableOpacity>
        )}
      </View>

      {isAlarmSet && (
        <Text style={styles.alarmStatus}>Alarm set for {alarmTime}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  alarmContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 18,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  alarmStatus: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
});

export default AlarmClock;
