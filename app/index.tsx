import React, { useEffect, useState, useRef } from "react";
import { View, Text, Button, Platform } from "react-native";
import notifee, { AndroidImportance } from "@notifee/react-native";

const App: React.FC = () => {
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeCheckRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    // Function to be triggered at a specific time
    const triggerFunction = () => {
      console.log("run this");
      // Remove the isNotificationRunning check
      // Clear any existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Start a new interval
      intervalRef.current = setInterval(() => {
        // Directly call the async function to schedule notification
        scheduleRepeatingNotification();
      }, 3000);
    };

    // Set up an interval to check the time every second
    timeCheckRef.current = setInterval(() => {
      const now = new Date();

      // Check if current time matches your desired time (12:17 in this example)
      if (now.getHours() === 12 && now.getMinutes() === 36) {
        triggerFunction();
      }
    }, 1000);

    // Cleanup interval on component unmount
    return () => {
      if (timeCheckRef.current) {
        clearInterval(timeCheckRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Remove dependency on isNotificationRunning

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
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Optional: Cancel all displayed notifications
    await notifee.cancelAllNotifications();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Immediate and Repeating Notification Example</Text>
      <Button
        title="Start Notifications"
        onPress={scheduleRepeatingNotification}
      />
      <Button
        title="Cancel Notification"
        onPress={cancelNotification}
        color="red"
      />
    </View>
  );
};

export default App;
