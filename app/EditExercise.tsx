import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../components/CustomButton/CustomButton";
import AppBar from "../components/AppBar/AppBar";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute,RouteProp } from "@react-navigation/native";
import { StackNavigationProp} from "@react-navigation/stack";
import CustomTextInput from "@/components/CustomTextInput/CustomTextInput";
// Define your navigation types inline
type RootStackParamList = {
  EditExercise: { exercise: any; muscle: string };
  MuscleDetail: { muscle: string };
};

type EditExerciseNavigationProp = StackNavigationProp<RootStackParamList, 'EditExercise'>;
type EditExerciseRouteProp = RouteProp<RootStackParamList, 'EditExercise'>;

export default function EditExercise() {
  const navigation = useNavigation<EditExerciseNavigationProp>();
  const route = useRoute<EditExerciseRouteProp>();
  const { exercise: initialExercise, muscle: muscleName } = route.params;

  const [exercise, setExercise] = useState<any>(initialExercise);
  const [muscle, setMuscle] = useState(muscleName);
  const [type, setType] = useState(exercise?.isFreeWeight ? "Free Weight" : exercise?.isMachine ? "Machine" : "");
  const [weight, setWeight] = useState(exercise?.weight || 0);
  const [reps, setReps] = useState(exercise?.reps || 0);
  const [sets, setSets] = useState(exercise?.sets || 0);
  const [isMachine, setIsMachine] = useState(exercise?.isMachine || false);
  const [isFreeWeight, setIsFreeWeight] = useState(exercise?.isFreeWeight || false);

  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        const result = await AsyncStorage.getItem("muscles");
        if (result) {
          const muscles = JSON.parse(result);
          const muscle = muscles.find((m: any) => m.name === muscleName);
          if (muscle && muscle.exercises) {
            const exercise = muscle.exercises.find((e: any) => e.name === initialExercise.name);
            if (exercise) {
              setExercise(exercise);
              setWeight(exercise.weight || 0);
              setReps(exercise.reps || 0);
              setSets(exercise.sets || 0);
              setType(exercise.isFreeWeight ? "Free Weight" : exercise.isMachine ? "Machine" : "");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching exercise data:", error);
        Alert.alert("Error", "Unable to fetch exercise data.");
      }
    };
    fetchExerciseData();
  }, [muscleName, initialExercise.name]);

  const handleEdit = async () => {
    const newEntry = {
      weight,
      reps,
      sets,
      date: new Date().toISOString(),
    };

    const updatedHistory = {
      freeWeight: exercise.history?.freeWeight || [],
      machine: exercise.history?.machine || [],
    };

    if (type === "Free Weight") {
      updatedHistory.freeWeight.push(newEntry);
    } else if (type === "Machine") {
      updatedHistory.machine.push(newEntry);
    }

    const updatedExercise = {
      ...exercise,
      weight,
      reps,
      sets,
      history: updatedHistory,
    };

    try {
      const result = await AsyncStorage.getItem("muscles");
      const muscles = result ? JSON.parse(result) : [];
      const muscleIndex = muscles.findIndex((m: any) => m.name === muscle);

      if (muscleIndex === -1) {
        Alert.alert("Error", "Muscle not found.");
        return;
      }

      const exerciseIndex = muscles[muscleIndex].exercises.findIndex((e: any) => e.name === exercise.name);

      if (exerciseIndex === -1) {
        Alert.alert("Error", "Exercise not found.");
        return;
      }

      muscles[muscleIndex].exercises[exerciseIndex] = updatedExercise;
      await AsyncStorage.setItem("muscles", JSON.stringify(muscles));
      Alert.alert("Success", "Exercise updated successfully.");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating exercise:", error);
      Alert.alert("Error", "Unable to update exercise.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this exercise?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await AsyncStorage.getItem("muscles");
              const muscles = result ? JSON.parse(result) : [];
              const muscleIndex = muscles.findIndex((m: any) => m.name === muscle);

              if (muscleIndex === -1) {
                Alert.alert("Error", "Muscle not found.");
                return;
              }

              const exerciseIndex = muscles[muscleIndex].exercises.findIndex((e: any) => e.name === exercise.name);

              if (exerciseIndex === -1) {
                Alert.alert("Error", "Exercise not found.");
                return;
              }

              muscles[muscleIndex].exercises.splice(exerciseIndex, 1);
              await AsyncStorage.setItem("muscles", JSON.stringify(muscles));
              Alert.alert("Success", "Exercise deleted successfully.");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting exercise:", error);
              Alert.alert("Error", "Unable to delete exercise.");
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <AppBar
        title={`Edit ${exercise?.name}`}
        isCanGoBack={true}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
        <Text style={styles.label}>Exercise Weight:</Text>
        <CustomTextInput
          value={String(weight)}
          onChangeText={(text:any) => setWeight(Number(text))}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Exercise Reps:</Text>
        <CustomTextInput
          value={String(reps)}
          onChangeText={(text:any) => setReps(Number(text))}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Exercise Sets:</Text>
        <CustomTextInput
          value={String(sets)}
          onChangeText={(text:any) => setSets(Number(text))}
          keyboardType="numeric"
        />

        <Picker
          selectedValue={type}
          onValueChange={(itemValue: string) => setType(itemValue)}
          style={[{color: "#000", backgroundColor: "#fff",borderRadius: 8,marginBottom: 20}]}
        >
          <Picker.Item label="Select Exercise Type" value="" />
          {isFreeWeight && <Picker.Item label="Free Weight" value="Free Weight" />}
          {isMachine && <Picker.Item label="Machine" value="Machine" />}
        </Picker>

        <CustomButton title="Save Exercise" onPress={handleEdit} />
        <CustomButton title="Delete Exercise" onPress={handleDelete} />

        <Text style={styles.historyTitle}>History:</Text>
        {exercise.history?.freeWeight.length > 0 && (
          <>
            <Text style={styles.historySubTitle}>Free Weight History:</Text>
            {exercise.history.freeWeight.slice().reverse().map((entry: any, index: number) => (
              <View key={index} style={styles.historyEntry}>
                <Text style={styles.historyText}>Date: {new Date(entry.date).toLocaleDateString()}</Text>
                <Text style={styles.historyText}>Weight: {entry.weight}</Text>
                <Text style={styles.historyText}>Reps: {entry.reps}</Text>
                <Text style={styles.historyText}>Sets: {entry.sets}</Text>
              </View>
            ))}
          </>
        )}
        {exercise.history?.machine.length > 0 && (
          <>
            <Text style={styles.historySubTitle}>Machine History:</Text>
            {exercise.history.machine.slice().reverse().map((entry: any, index: number) => (
              <View key={index} style={styles.historyEntry}>
                <Text style={styles.historyText}>Date: {new Date(entry.date).toLocaleDateString()}</Text>
                <Text style={styles.historyText}>Weight: {entry.weight}</Text>
                <Text style={styles.historyText}>Reps: {entry.reps}</Text>
                <Text style={styles.historyText}>Sets: {entry.sets}</Text>
              </View>
            ))}
          </>
        )}
        {(!exercise.history?.freeWeight.length && !exercise.isFreeWeight) &&
         (!exercise.history?.machine.length && !exercise.isMachine) && (
          <Text>No history available</Text>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor:"#f9fafb"

  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    color: "#000"

  },

  historyTitle: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "bold",
    color: "#000",

  },
  historySubTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    color: "#000",
  },
  historyText:{
    color: "#000",
  },
  historyEntry: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    color: "#000",
  },
});
