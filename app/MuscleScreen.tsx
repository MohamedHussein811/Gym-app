import React, { useEffect, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Alert,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AppBar from "../components/AppBar/AppBar";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AddExerciseModal from "./AddExerciseModal";
import CustomButton from "@/components/CustomButton/CustomButton";

type RootStackParamList = {
  MuscleScreen: { muscle: string };
  AddExercise: { muscle: string };
  EditExercise: { exercise: any; muscle: string };
  ViewHistory: { exercise: any; muscle: string; type: string, historyGroupName: string };
};

type MuscleScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MuscleScreen"
>;
type MuscleScreenRouteProp = RouteProp<RootStackParamList, "MuscleScreen">;

export default function MuscleScreen() {
  const navigation = useNavigation<MuscleScreenNavigationProp>();
  const route = useRoute<MuscleScreenRouteProp>();
  const [groupedExercises, setGroupedExercises] = useState<any[]>([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseType, setExerciseType] = useState<string>("");
  const [exerciseDetails, setExerciseDetails] = useState({
    name: "",
    weight: "",
    reps: "",
    sets: "",
    notes: "",
  });
  const [showAddExerciseDetailsModal, setShowAddExerciseDetailsModal] =
    useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const getData = async () => {
    try {
      const result = await AsyncStorage.getItem("muscles");
      if (result) {
        const muscles = JSON.parse(result);
        const muscle = muscles.find(
          (muscle: any) => muscle.name === route.params?.muscle
        );
        if (muscle && muscle.exercises) {
          const exercisesWithGroupedHistory = muscle.exercises.map(
            (exercise: any) => {
              // Group history entries by type and name
              const groupHistory = (type: string) => {
                const history = exercise.history?.[type] || [];
                const sortedHistory = history
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date (recent to old)
                const grouped = sortedHistory.reduce((acc: any, entry: any) => {
                  const existing = acc.find(
                    (item: any) => item.name === entry.name
                  );
                  if (existing) {
                    existing.entries.push(entry);
                  } else {
                    acc.push({ name: entry.name, entries: [entry] });
                  }
                  return acc;
                }, []);
                return grouped;
              };
  
              return {
                ...exercise,
                freeWeightHistory: groupHistory("freeWeight"),
                machineHistory: groupHistory("machine"),
                bodyWeightHistory: groupHistory("bodyWeight"),
              };
            }
          );
          setGroupedExercises(exercisesWithGroupedHistory);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Unable to fetch exercise data.");
    }
  };
  

  useEffect(() => {
    getData();
  }, [route.params?.muscle, navigation,]);

  const handleAddExercise = () => {
    setShowAddExerciseModal(false);
  };

  const handleAddExType = async (selectedType: string, item: any) => {
    let isFreeWeight = item.isFreeWeight || false;
    let isMachine = item.isMachine || false;
    let isBodyWeight = item.isBodyWeight || false;
  
    if (selectedType === "Free Weight") {
      isFreeWeight = true;
    } else if (selectedType === "Machine") {
      isMachine = true;
    } else if (selectedType === "Body Weight") {
      isBodyWeight = true;
    }
  
    try {
      const result = await AsyncStorage.getItem("muscles");
      if (result) {
        const muscles = JSON.parse(result);
        const muscle = muscles.find(
          (muscle: any) => muscle.name === route.params?.muscle
        );
        if (muscle) {
          const updatedExercises = muscle.exercises.map((ex: any) => {
            if (ex.name === item.name) {
              return {
                ...ex,
                isFreeWeight,
                isMachine,
                isBodyWeight,
              };
            }
            return ex;
          });
  
          const updatedMuscles = muscles.map((m: any) => {
            if (m.name === route.params?.muscle) {
              return {
                ...m,
                exercises: updatedExercises,
              };
            }
            return m;
          });
  
          await AsyncStorage.setItem("muscles", JSON.stringify(updatedMuscles));
          //setGroupedExercises(updatedExercises);
          getData();
          Alert.alert("Success", "Exercise type updated successfully.");
        }
      }
    } catch (error) {
      console.error("Error updating exercise type:", error);
      Alert.alert("Error", "Unable to update exercise type.");
    }
  };
  

  const handleSaveExerciseDetails = async () => {
    if (!selectedExercise || !selectedType) {
      Alert.alert("Error", "Exercise or type is not selected.");
      return;
    }

    if (
      !exerciseDetails.name ||
      !exerciseDetails.weight ||
      !exerciseDetails.reps ||
      !exerciseDetails.sets ||
      !exerciseDetails.notes
    ) {
      Alert.alert("Error", "Please fill in all the details.");
      return;
    }

    try {
      const result = await AsyncStorage.getItem("muscles");
      if (result) {
        const muscles = JSON.parse(result);
        const muscle = muscles.find(
          (muscle: any) => muscle.name === route.params?.muscle
        );

        if (muscle) {
          const updatedExercises = muscle.exercises.map((ex: any) => {
            if (ex.name === selectedExercise.name) {
              const historyKey =
                selectedType === "Free Weight"
                  ? "freeWeight"
                  : selectedType === "Machine"
                  ? "machine"
                  : "bodyWeight";

              const newHistory = ex.history ? ex.history[historyKey] || [] : [];
              newHistory.push({
                date: new Date().toISOString(),
                ...exerciseDetails,
              });

              return {
                ...ex,
                history: {
                  ...ex.history,
                  [historyKey]: newHistory,
                },
              };
            }
            return ex;
          });

          const updatedMuscles = muscles.map((m: any) => {
            if (m.name === route.params?.muscle) {
              return {
                ...m,
                exercises: updatedExercises,
              };
            }
            return m;
          });

          await AsyncStorage.setItem("muscles", JSON.stringify(updatedMuscles));
          setGroupedExercises(updatedExercises);
          getData();
          Alert.alert("Success", "Exercise details added successfully.");
          setShowAddExerciseDetailsModal(false);
          setSelectedExercise(null);
          setSelectedType("");
          setExerciseDetails({
            name: "",
            weight: "",
            reps: "",
            sets: "",
            notes: "",
          });
        } else {
          Alert.alert("Error", "Muscle not found.");
        }
      } else {
        Alert.alert("Error", "No data found in AsyncStorage.");
      }
    } catch (error) {
      console.error("Error saving exercise details:", error);
      Alert.alert("Error", "Unable to save exercise details.");
    }
  };

  const handleExerciseDelete = async (exerciseName: string) => {
    try {
      const result = await AsyncStorage.getItem("muscles");
      if (result) {
        const muscles = JSON.parse(result);
        const muscle = muscles.find(
          (muscle: any) => muscle.name === route.params?.muscle
        );
  
        if (muscle) {
          // Filter out the exercise to be deleted
          const updatedExercises = muscle.exercises.filter(
            (ex: any) => ex.name !== exerciseName
          );
  
          // Update the list of muscles with the filtered exercises
          const updatedMuscles = muscles.map((m: any) => {
            if (m.name === route.params?.muscle) {
              return {
                ...m,
                exercises: updatedExercises,
              };
            }
            return m;
          });
  
          await AsyncStorage.setItem("muscles", JSON.stringify(updatedMuscles));
          setGroupedExercises(updatedExercises);
          getData();
          Alert.alert("Success", "Exercise deleted successfully.");
          setShowAddExerciseDetailsModal(false);
          setSelectedExercise(null);
          setSelectedType("");
          setExerciseDetails({
            name: "",
            weight: "",
            reps: "",
            sets: "",
            notes: "",
          });
        } else {
          Alert.alert("Error", "Muscle not found.");
        }
      } else {
        Alert.alert("Error", "No data found in AsyncStorage.");
      }
    } catch (error) {
      console.error("Error deleting exercise:", error);
      Alert.alert("Error", "Unable to delete exercise.");
    }
  };
  
  

  return (
    <>
      <AppBar
        title={route.params?.muscle}
        isCanGoBack={true}
        onBackPress={() => navigation.goBack()}

      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
        <TouchableOpacity
          onPress={() => setShowAddExerciseModal(true)}
          style={styles.addExerciseButton}
        >
          <View style={styles.iconContainerWrapper}>
            <View style={styles.iconContainer}>
              <Icon
                name="add"
                size={30}
                color="#1d4ed8"
                style={styles.addIcon}
              />
            </View>
            <Text style={styles.customizeText}>Customize Exercise</Text>
          </View>
        </TouchableOpacity>

        {groupedExercises.map((item: any, index: number) => (
          <View key={index} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{item.name}</Text>
            </View>
            <View style={styles.exerciseDetails}>
              {item.isFreeWeight && (
                <View style={styles.exerciseTypeSection}>
                  <View style={styles.typeInfo}>
                    <Text style={styles.exerciseType}>Free Weight</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedExercise(item);
                        setSelectedType("Free Weight");
                        setShowAddExerciseDetailsModal(true);
                      }}
                      style={styles.addDetailsButton}
                    >
                      <Icon name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  {item.freeWeightHistory && item.freeWeightHistory.map(
                    (historyGroup: any, idx: number) => (
                      <View key={idx} style={styles.historyGroup}>
                      <TouchableOpacity
                        style={styles.historyGroupName}
                        onPress={() =>
                          navigation.navigate("ViewHistory", {
                            exercise: item,
                            muscle: route.params?.muscle,
                            type: "freeWeight",
                            historyGroupName: historyGroup.name,
                          })
                        }
                      >
                        <Text style={styles.historyGroupName}>{historyGroup.name}</Text>
                        </TouchableOpacity>
                        {historyGroup.entries.map(
                          (entry: any, entryIdx: number) => (
                            <Text key={entryIdx} style={styles.historyText}>
                              {entry.weight}x{entry.reps}, {entry.sets} sets,
                              Notes: {entry.notes}
                            </Text>
                          )
                        )}
                      </View>
                    )
                  )}
                </View>
              )}
              {item.isMachine &&  (
                <View style={styles.exerciseTypeSection}>
                  <View style={styles.typeInfo}>
                    <Text style={styles.exerciseType}>Machine</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedExercise(item);
                        setSelectedType("Machine");
                        setShowAddExerciseDetailsModal(true);
                      }}
                      style={styles.addDetailsButton}
                    >
                      <Icon name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  {item.machineHistory && item.machineHistory.map((historyGroup: any, idx: number) => (
                    <View key={idx} style={styles.historyGroup}>
                      <TouchableOpacity
                        style={styles.historyGroupName}
                        onPress={() =>
                          navigation.navigate("ViewHistory", {
                            exercise: item,
                            muscle: route.params?.muscle,
                            type: "machine",
                            historyGroupName: historyGroup.name,
                          })
                        }
                      >
                        <Text style={styles.historyGroupName}>{historyGroup.name}</Text>
                        </TouchableOpacity>
                      {historyGroup.entries.map(
                        (entry: any, entryIdx: number) => (
                          <Text key={entryIdx} style={styles.historyText}>
                            {entry.weight}x{entry.reps}, {entry.sets} sets,
                            Notes: {entry.notes}
                          </Text>
                        )
                      )}
                    </View>
                  ))}
                </View>
              )}
              {item.isBodyWeight && (
                <View style={styles.exerciseTypeSection}>
                  <View style={styles.typeInfo}>
                    <Text style={styles.exerciseType}>Body Weight</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedExercise(item);
                        setSelectedType("Body Weight");
                        setShowAddExerciseDetailsModal(true);
                      }}
                      style={styles.addDetailsButton}
                    >
                      <Icon name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  {item.bodyWeightHistory && item.bodyWeightHistory.map(
                    (historyGroup: any, idx: number) => (
                      <View key={idx} style={styles.historyGroup}>
                        <TouchableOpacity
                          style={styles.historyGroupName}
                          onPress={() =>
                            navigation.navigate("ViewHistory", {
                              exercise: item,
                              muscle: route.params?.muscle,
                              type: "bodyWeight",
                              historyGroupName: historyGroup.name,
                            })
                          }
                        >
                        <Text style={styles.historyGroupName}>{historyGroup.name}</Text>
                        </TouchableOpacity>
                        {historyGroup.entries.map(
                          (entry: any, entryIdx: number) => (
                            <Text key={entryIdx} style={styles.historyText}>
                              {entry.weight}x{entry.reps}, {entry.sets} sets,
                              Notes: {entry.notes}
                            </Text>
                          )
                        )}
                      </View>
                    )
                  )}
                </View>
              )}
            </View>
            <Picker
              selectedValue={exerciseType}
              onValueChange={(value) => handleAddExType(value, item)}
              style={styles.picker}
              itemStyle={{ color: "#000" }}
            >
              <Picker.Item label="Select Exercise Type" value="" />
              <Picker.Item label="Free Weight" value="Free Weight" />
              <Picker.Item label="Machine" value="Machine" />
              <Picker.Item label="Body Weight" value="Body Weight" />
            </Picker>

            <CustomButton
              title="Delete Exercise"
              onPress={() => handleExerciseDelete(item.name)}
            />
          </View>
        ))}

        {/* Add Exercise Modal */}
        <AddExerciseModal
          visible={showAddExerciseModal}
          onClose={() => setShowAddExerciseModal(false)}
          onSave={handleAddExercise}
          muscle={route.params?.muscle}
        />

        {/* Add Exercise Details Modal */}
        <Modal
          visible={showAddExerciseDetailsModal}
          onRequestClose={() => setShowAddExerciseDetailsModal(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Exercise Details</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Name"
              value={exerciseDetails.name}
              onChangeText={(text) =>
                setExerciseDetails({ ...exerciseDetails, name: text })
              }
            />
            <TextInput
              style={styles.textInput}
              placeholder="Weight"
              value={exerciseDetails.weight}
              onChangeText={(text) =>
                setExerciseDetails({ ...exerciseDetails, weight: text })
              }
            />
            <TextInput
              style={styles.textInput}
              placeholder="Reps"
              value={exerciseDetails.reps}
              onChangeText={(text) =>
                setExerciseDetails({ ...exerciseDetails, reps: text })
              }
            />
            <TextInput
              style={styles.textInput}
              placeholder="Sets"
              value={exerciseDetails.sets}
              onChangeText={(text) =>
                setExerciseDetails({ ...exerciseDetails, sets: text })
              }
            />
            <TextInput
              style={styles.textInput}
              placeholder="Notes"
              value={exerciseDetails.notes}
              onChangeText={(text) =>
                setExerciseDetails({ ...exerciseDetails, notes: text })
              }
            />
            <View style={styles.buttons}>
              <CustomButton title="Save" onPress={handleSaveExerciseDetails} />
              <CustomButton
                title="Cancel"
                onPress={() => setShowAddExerciseDetailsModal(false)}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 10,
  },
  pickercontainer: {
    flex: 1,
  },
  typeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    marginVertical: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    flex: 1,
  },
  exerciseDetails: {
    paddingVertical: 10,
  },
  exerciseTypeSection: {
    marginBottom: 10,
  },
  exerciseType: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 5,
  },
  historyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  addDetailsButton: {
    marginTop: 5,
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    marginTop: 10,
    color: "#000000",
  },
  iconContainerWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  addIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  customizeText: {
    marginLeft: 10,
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 20,
    width: "100%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111827",
  },
  textInput: {
    height: 40,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    marginBottom: 15,
    width: "100%",
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  addExerciseButton: {
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttons: {
    flexDirection: "column",
    marginTop: 20,
    width: "100%",
  },
  historyGroup: {
    marginBottom: 10,
  },
  historyGroupName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 5,
    textDecorationLine: "underline",
  },
});
