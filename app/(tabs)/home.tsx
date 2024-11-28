import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

interface WakeTimeProps {
  time: string;
  cycles: number;
  hours: string;
  colorClass: string;
}

const WakeTimeCard = ({ time, cycles, hours, colorClass }: WakeTimeProps) => (
  <View className="w-[100] p-2 rounded-xl bg-[#1a1625] justify-center items-center">
    <Text className={`text-xl font-bold ${colorClass}`}>{time}</Text>
    <Text className={`text-sm ${colorClass}`}>{cycles} cycles</Text>
    <Text className="text-gray-400 text-xs">{hours} hr</Text>
  </View>
);

export default function Home() {
  const wakeTimes: WakeTimeProps[] = [
    { colorClass: "text-[#ff6b6b]", cycles: 1, hours: "1.5", time: "11:30 PM" },
    { colorClass: "text-[#ff6b6b]", cycles: 2, hours: "3.0", time: "1:00 AM" },
    { colorClass: "text-[#ffd93d]", cycles: 3, hours: "4.5", time: "2:30 AM" },
    { colorClass: "text-[#ffd93d]", cycles: 4, hours: "6.0", time: "4:00 AM" },
    { colorClass: "text-[#6bff84]", cycles: 5, hours: "7.5", time: "5:30 AM" },
    { colorClass: "text-[#6bff84]", cycles: 6, hours: "9.0", time: "7:00 AM" },
  ];

  return (
    <ScrollView className="flex-1 bg-[#0f0817]">
      <View className="flex-1 p-6  h-100 flex items-center justify-center min-h-[100vh]">
        {/* Current Time Display */}
        <View className="items-center mb-8">
          <Text className="mb-2">🌙</Text>
          <View className="flex-row items-center space-x-2">
            <Text className="text-white text-4xl font-bold">10:41</Text>
            <Text className="text-white text-2xl">PM</Text>
          </View>
        </View>

        {/* Wake Up Times Section */}
        <Text className="text-white text-xl mb-4">Best wake up times:</Text>
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {wakeTimes.map((wakeTime, index) => (
            <WakeTimeCard key={index} {...wakeTime} />
          ))}
        </View>

        {/* How It Works Section */}
        <View className="mt-8 bg-[#1a1625] p-6 rounded-xl">
          <Text className="text-white text-lg font-bold mb-4">
            HOW IT WORKS
          </Text>
          <View className="space-y-4">
            <Text className="text-gray-300">
              • It takes the average person fifteen minutes to fall asleep.
            </Text>
            <Text className="text-gray-300">
              • A good night's sleep consists of 5 to 6 complete sleep cycles.
              {"\n"}
              Each cycle lasts about 90 minutes.
            </Text>
            <Text className="text-gray-300">
              • Waking up in the middle of a sleep cycle leaves you feeling
              tired and groggy, but waking up in between cycles lets you wake up
              feeling refreshed and alert!
            </Text>
            <Text className="text-blue-400">
              Learn more in the sleepytime app.
            </Text>
          </View>
        </View>

        {/* Back Button */}
        <CustomButton
          handlePress={() => {
            router.push("/");
          }}
          title="Go Home"
          containerStyles="w-full mt-7"
        />
      </View>
    </ScrollView>
  );
}
