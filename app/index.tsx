import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";

const App = () => {
  return (
    <View className="flex justify-center items-center flex-1">
      <Text className="text-primary text-3xl font-pblack">Hello Word</Text>
      <StatusBar style="auto" />
      <Link href={"/home"} style={{ color: "blue" }}>
        Go to home
      </Link>
    </View>
  );
};

export default App;

// const styles = StyleSheet.create({
//   container: {
//     display: "flex",
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
