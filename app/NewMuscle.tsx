import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import AppBar from "@/components/AppBar/AppBar";
import CustomButton from "@/components/CustomButton/CustomButton";
import CustomTextInput from "@/components/CustomTextInput/CustomTextInput";
import { defaultImage } from "@/constants/images";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
// Define your navigation types inline
type RootStackParamList = {
  HomeScreen: undefined;
  AnalyzeMuscle: { muscle: string };
  MuscleDetail: { muscle: string };
  NewMuscle: undefined;
};

type NewMuscleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'NewMuscle'>;

export default function NewMuscle() {
  const [imageUri, setImageUri] = useState<string>(defaultImage ?? ""); // Set initial image
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const navigation = useNavigation<NewMuscleScreenNavigationProp>();

  const selectImage = () => {
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    }).then((result) => {
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    });
  };

  const handleSubmit = () => {
    if (!name || !imageUri) {
      alert("Please fill all the fields");
      return;
    }
    const newMuscle = {
      name,
      subtitle,
      imageUri,
    };

    AsyncStorage.getItem("muscles").then((result) => {
      const muscles = result ? JSON.parse(result) : [];
      if (muscles.find((m: any) => m.name === name)) {
        alert("Muscle already exists, please choose a different name");
        return;
      }
      muscles.push(newMuscle);
      AsyncStorage.setItem("muscles", JSON.stringify(muscles)).then(() => {
        navigation.navigate("HomeScreen");
      });
    });
  };

  
  return (
    <>
      <AppBar
        title="New Muscle"
        isCanGoBack={true}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title:</Text>
          <CustomTextInput
            value={name}
            onChangeText={setName}
            placeholder="Muscle Name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Subtitle: (optional)</Text>
          <CustomTextInput
            value={subtitle}
            onChangeText={setSubtitle}
            placeholder="Muscle Subtitle"
          />
        </View>


        <CustomButton title="Save" onPress={handleSubmit} />
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor:"#f9fafb",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
  },
  inputContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#000",

  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    color: "#000",

  },
});
