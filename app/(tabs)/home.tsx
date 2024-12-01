import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export interface WakeTimeProps {
  time: string;
  cycles: number;
  hours: string;
  colorClass: string;
  alarm: boolean;
  timeRaw: Date;
}

const WakeTimeCard = ({
  time,
  cycles,
  hours,
  colorClass,
  alarm,
}: WakeTimeProps) => {
  return (
    <View
      className={`w-[100] p-2 rounded-xl ${
        alarm ? "bg-[#211b31]" : "bg-[#1a1625]"
      } justify-center items-center`}
    >
      <Text className={`text-xl font-psemibold ${colorClass}`}>{time}</Text>
      <Text className={`text-sm font-pregular ${colorClass}`}>
        {cycles} cycles
      </Text>
      <Text className="text-gray-400 font-pregular text-xs mb-2">
        {hours} hr
      </Text>
      {alarm && <Text>🔔</Text>}
    </View>
  );
};

export default function Home({
  cycleTime,
  handleAlarm,
}: {
  cycleTime: WakeTimeProps[];
  handleAlarm: (time: Date, index: number) => void;
}) {
  // const wakeTimes: WakeTimeProps[] = [
  //   { colorClass: "text-[#ff6b6b]", cycles: 1, hours: "1.5", time: "12:30 AM" },
  //   { colorClass: "text-[#ff6b6b]", cycles: 2, hours: "3.0", time: "2:00 AM" },
  //   { colorClass: "text-[#ffd93d]", cycles: 3, hours: "4.5", time: "3:30 AM" },
  //   { colorClass: "text-[#ffd93d]", cycles: 4, hours: "6.0", time: "5:00 AM" },
  //   { colorClass: "text-[#6bff84]", cycles: 5, hours: "7.5", time: "6:30 AM" },
  //   { colorClass: "text-[#6bff84]", cycles: 6, hours: "9.0", time: "8:00 AM" },
  // ];

  return (
    <ScrollView className="flex-1 bg-[#0f0817]">
      <View className="flex-1 flex items-center justify-center">
        {/* Current Time Display */}
        <View className="items-center mb-8">
          {/* <Text className="mb-2">🌙</Text> */}
          {/* <View className="flex-row items-center space-x-2">
            <Text className="text-white text-4xl font-bold">10:41</Text>
            <Text className="text-white text-2xl">PM</Text>
          </View> */}
        </View>

        {/* Wake Up Times Section */}
        <Text className="text-white text-xl mb-4">Best wake up times:</Text>
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {cycleTime.map((wakeTime, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleAlarm(wakeTime?.timeRaw, index)}
            >
              <WakeTimeCard key={index} {...wakeTime} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
