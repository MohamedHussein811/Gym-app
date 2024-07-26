import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useColorScheme } from "@/hooks/useColorScheme";
import AnalysisScreen from "./AnalysisScreen";
import NewMuscle from "./NewMuscle";
import IntroScreen from "./IntroScreen";
import EditExercise from "./EditExercise";
import HomeScreen from "./HomeScreen";
import MuscleScreen from "./MuscleScreen";
import ViewHistory from "./ViewHistory";

const Stack = createNativeStackNavigator();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [passedIntro, setPassedIntro] = useState<boolean | null>(null);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const checkIntroStatus = async () => {
      try {
        const result = await AsyncStorage.getItem("passedIntro");
        setPassedIntro(result === "true");
      } catch (error) {
        console.error(error);
      }
    };
    checkIntroStatus();
  }, []);

  if (!fontsLoaded || passedIntro === null) {
    return null;
  }

  return (
    <>
      <StatusBar backgroundColor={colorScheme === "dark" ? "#171717" :"#e5e7eb"} barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}  />
        <Stack.Navigator
          initialRouteName={passedIntro ? "HomeScreen" : "IntroScreen"}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="IntroScreen">
            {() => <IntroScreen />}
          </Stack.Screen>
          <Stack.Screen name="HomeScreen">{() => <HomeScreen />}</Stack.Screen>
          <Stack.Screen name="MuscleScreen">
            {() => <MuscleScreen />}
          </Stack.Screen>
          <Stack.Screen name="NewMuscle">{() => <NewMuscle />}</Stack.Screen>
          <Stack.Screen name="EditExercise">
            {() => <EditExercise />}
          </Stack.Screen>
          <Stack.Screen name="AnalysisScreen">
            {() => <AnalysisScreen />}
          </Stack.Screen>
          <Stack.Screen name="ViewHistory">
            {() => <ViewHistory />}
          </Stack.Screen>
          
        </Stack.Navigator>
    </>
  );
}
