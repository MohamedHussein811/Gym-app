import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AppBar from "../components/AppBar/AppBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from '@react-navigation/native';

type Exercise = {
    type: string;
    // Add other properties based on your exercise data structure
};

type Muscle = {
    name: string;
    exercises: Exercise[];
};

export default function AnalysisScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const muscle = (route.params as { muscle?: string })?.muscle;
    const [groupedExercises, setGroupedExercises] = useState<{ [key: string]: Exercise[] }>({});

    useEffect(() => {
        const getData = async () => {
            const result = await AsyncStorage.getItem("muscles");
            if (result) {
                const muscles: Muscle[] = JSON.parse(result);
                const muscleData = muscles.find(m => m.name === muscle);
                if (muscleData && muscleData.exercises) {
                    const categorized = muscleData.exercises.reduce((acc: { [key: string]: Exercise[] }, exercise: Exercise) => {
                        (acc[exercise.type] = acc[exercise.type] || []).push(exercise);
                        return acc;
                    }, {});
                    setGroupedExercises(categorized);
                }
            }
        };

        getData();
    }, [muscle]);

    return (
        <>
            <AppBar title={`${muscle} Workout Analysis`} isCanGoBack={true} onBackPress={() => navigation.goBack()} />
            <View style={styles.container}>
                <Text style={styles.text}>Soon</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9fafb",
    },
    text: {
        fontSize: 18,
        color: "#f00",
    },
});
