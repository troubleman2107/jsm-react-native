import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

type CustomButtonProps = {
  title: string;
  handlePress: () => void;
  containerStyles: string;
  textStyles?: string;
  isLoading?: boolean;
};

const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading = false,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      className={`bg-secondary rounded-xl min-h-[32px] flex flex-row justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      activeOpacity={0.7}
      disabled={isLoading}
      onPress={handlePress}
    >
      <Text className="text-primary font-psemibold text-lg">{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({});
