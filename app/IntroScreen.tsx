import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  Animated,
  Dimensions,
  Alert,
  TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "@/components/CustomButton/CustomButton";
import { useNavigation } from '@react-navigation/native';
import CustomTextInput from "@/components/CustomTextInput/CustomTextInput";
import { StackNavigationProp } from "@react-navigation/stack";

const screenWidth = Dimensions.get("window").width;
type RootStackParamList = {
  HomeScreen: undefined;
  IntroScreen: undefined;
};

type IntroNavigationProp = StackNavigationProp<RootStackParamList, 'IntroScreen'>;
const IntroScreen = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [preferredWeight, setPreferredWeight] = useState("");

  const opacity = new Animated.Value(1);
  const navigation = useNavigation<IntroNavigationProp>();

  const nextStage = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStage(prev => (prev + 1) % 3);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleFinish = async () => {
    if (!age || !weight || !preferredWeight) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum > 120 || ageNum < 0) {
      Alert.alert("Invalid Age", "Please enter a valid age between 0 and 120");
      return;
    }

    await AsyncStorage.setItem("age", age);
    await AsyncStorage.setItem("weight", weight);
    await AsyncStorage.setItem("preferredWeight", preferredWeight);
    await AsyncStorage.setItem("passedIntro", "true");
    navigation.navigate("HomeScreen");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f9fafb",
    },
    stageContainer: {
      width: screenWidth - 40,
      alignItems: "center",
    },
    image: {
      width: "100%",
      height: 200,
      borderRadius: 20,
      marginBottom: 20,
    },
    text: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 20,
      color: "#000",
    },
    description: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 20,
      paddingHorizontal: 20,
      color: "#000",
    },
    input: {
      width: "100%",
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      marginBottom: 15,
      padding: 10,
    },
  });

  const renderStageContent = () => {
    switch (currentStage) {
      case 0:
        return (
          <>
            <Image source={require("../assets/images/Tools/intro1.jpg")} style={styles.image} />
            <Text style={styles.text}>Welcome to BodyLog!</Text>
            <Text style={styles.description}>
              Track your workouts, set goals, and monitor your progress with
              detailed analysis. Our app helps you stay motivated and achieve
              your fitness goals more effectively.
            </Text>
            <CustomButton title="Next" onPress={nextStage} />
          </>
        );
      case 1:
        return (
          <>
            <Image source={require("../assets/images/Tools/intro2.jpg")} style={styles.image} />
            <Text style={styles.text}>
              Track your workouts and get detailed analysis to achieve your
              goals.
            </Text>
            <CustomButton title="Next" onPress={nextStage} />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.text}>Please enter your details:</Text>
            <CustomTextInput
              placeholder="Age"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
            <CustomTextInput
              placeholder="Weight (kg)"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            <CustomTextInput
              placeholder="Preferred Weight (kg)"
              keyboardType="numeric"
              value={preferredWeight}
              onChangeText={setPreferredWeight}
            />
            <CustomButton title="Finish" onPress={handleFinish} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.stageContainer, { opacity }]}>
        {renderStageContent()}
      </Animated.View>
    </View>
  );
};



export default IntroScreen;
