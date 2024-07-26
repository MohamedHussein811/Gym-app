import React, { useState } from "react";
import { View, Modal, Text, TextInput, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultImage } from "@/constants/images";
import CustomButton from "@/components/CustomButton/CustomButton";

interface AddExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  muscle: any;
}

export default function AddExerciseModal({
  visible,
  onClose,
  onSave,
  muscle,
}: AddExerciseModalProps) {
  const [name, setName] = useState("");

  const handleSave = async () => {
    if (name.trim()) {
      onSave();
      setName("");
    }
    if(name === "") {
      alert("Please enter a name");
      return
    }

    const newExercise = {
      name,
      imageUri: defaultImage,
      subtitle: "",
      isFreeWeight: false,
      isMachine: false,
      isBodyWeight: false,
    }; 
    try {
      const result = await AsyncStorage.getItem("muscles");
      const muscles = result ? JSON.parse(result) : [];

      const muscleIndex = muscles.findIndex((m: any) => m.name === muscle);

      if (muscleIndex === -1) {
        alert("Muscle not found");
        return;
      }


      if (!muscles[muscleIndex].exercises) {
        muscles[muscleIndex].exercises = [];
      }

      const isNameDuplicated = muscles[muscleIndex].exercises.some(
        (e: any) => e.name === name
      );

      if (isNameDuplicated) {
        alert("Name is duplicated, please use another name");
        return;
      }

      muscles[muscleIndex].exercises.push(newExercise);
      await AsyncStorage.setItem("muscles", JSON.stringify(muscles));
      onClose();
    } catch (error) {
      alert(error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Exercise</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Exercise Name"
            style={styles.input}
          />
          <CustomButton title="Save" onPress={handleSave} />
          <CustomButton title="Cancel" onPress={onClose} />

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
    padding: 8,
    fontSize: 16,
  },
});
