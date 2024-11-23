import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { images } from "@/constants";
import CustomButton from "@/components/CustomButton";

const App = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full flex items-center justify-center h-full px-4 min-h-[85vh]">
          <Image
            source={images.logo}
            className="w-[130px] h-[94px]"
            resizeMode="contain"
          />

          <Image
            source={images.cards}
            className="w-full max-w-[380px] h-[298px]"
            resizeMode="contain"
          />

          <View className="relative mt-5">
            <Text className="text-3xl text-white font-bold text-center">
              Discover Endless{"\n"}
              Possibilities with{" "}
              <Text className="text-secondary-200">Aora</Text>
            </Text>

            <Image
              source={images.path}
              className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
              resizeMode="contain"
            />
          </View>
          <Text className="text-sm font-pregular text-gray-100 mt-7 text-center">
            Where Creativity Meets Innovation: Embark on a Journey of Limitless
            Exploration with Aora
          </Text>
          <CustomButton
            handlePress={() => {
              router.push("/sign-in");
            }}
            isLoading={isLoading}
            title="Continue with Email"
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>
      <StatusBar style="light" backgroundColor="#161622" />
    </SafeAreaView>
  );
};

export default App;
