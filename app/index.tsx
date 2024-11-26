import React, { useEffect, useState } from "react";
import { View, Text, Button, Platform } from "react-native";
import notifee, {
  AndroidImportance,
  IntervalTrigger,
  TimestampTrigger,
  TimeUnit,
  TriggerType,
} from "@notifee/react-native";

const App: React.FC = () => {
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  const [notificationId, setNotificationId] = useState<string | null>(null);

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

  const scheduleRepeatingNotification = async () => {
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
      body: "This notification was triggered immediately.",
      android: {
        channelId: "default",
        sound: "default",
      },
      ios: {
        sound: "default",
      },
    });

    const date = new Date();
    date.setHours(23);
    date.setMinutes(4);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    // Schedule a repeating notification
    // const trigger: IntervalTrigger = {
    //   type: TriggerType.INTERVAL,
    //   interval: 1, // Repeats every 1 second
    //   timeUnit: TimeUnit.SECONDS,
    // };

    const id = await notifee.createTriggerNotification(
      {
        title: "Repeating Notification",
        body: "This notification repeats every second.",
        android: {
          channelId: "default",
          sound: "default",
        },
        ios: {
          sound: "default",
        },
      },
      trigger
    );

    setNotificationId(id); // Store notification ID for canceling
    console.log(`Repeating notification scheduled with ID: ${id}`);
  };

  let interVal = setInterval(() => {
    scheduleRepeatingNotification();
  }, 5000);

  // setInterval(() => {
  //   scheduleRepeatingNotification();
  // }, 5000);

  const cancelNotification = async () => {
    if (notificationId) {
      await notifee.cancelNotification(notificationId);
      setNotificationId(null);
      // clearInterval(interVal);
      console.log("Notification canceled");
    } else {
      console.log("No notification to cancel");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Immediate and Repeating Notification Example</Text>
      {/* <Button
        title="Start Notifications"
        onPress={scheduleRepeatingNotification}
      /> */}
      <Button
        title="Cancel Notification"
        onPress={cancelNotification}
        color="red"
      />
    </View>
  );
};

export default App;
