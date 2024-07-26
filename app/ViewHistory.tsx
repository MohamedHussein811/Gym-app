import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, RouteProp } from "@react-navigation/native";
import AppBar from "../components/AppBar/AppBar";

type RootStackParamList = {
  ViewHistory: { muscle: string; exercise: any; type: string; historyGroupName: string };
};

type ViewHistoryRouteProp = RouteProp<RootStackParamList, 'ViewHistory'>;

const ViewHistory: React.FC = () => {
  const route = useRoute<ViewHistoryRouteProp>();
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await AsyncStorage.getItem("muscles");
        if (result) {
          const muscles = JSON.parse(result);
          const muscle = muscles.find(
            (muscle: any) => muscle.name === route.params.muscle
          );
          if (muscle) {
            const exercise = muscle.exercises.find(
              (ex: any) => ex.name === route.params.exercise.name
            );
            if (exercise) {
              const selectedHistory = exercise.history[route.params.type] || [];
              const filteredHistory = selectedHistory
                .filter((entry: any) => entry.name === route.params.historyGroupName)
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date (recent to old)
              setHistoryData(filteredHistory);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching history data:", error);
      }
    };
    fetchHistory();
  }, [route.params.muscle, route.params.exercise.name, route.params.type, route.params.historyGroupName]);

  const renderHistoryEntries = (entries: any[]) => {
    const groupedEntries = entries.reduce((acc: any, entry: any) => {
      const name = entry.name || "Unnamed Exercise";
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(entry);
      return acc;
    }, {});

    return (
      <>
        {Object.keys(groupedEntries).map((name, index) => (
          <View key={index} style={styles.exerciseContainer}>
            <Text style={styles.exerciseName}>{name}</Text>
            {groupedEntries[name].map((entry: any, idx: number) => (
              <View key={idx} style={styles.historyEntry}>
                <Text style={styles.entryText}>Weight: {entry.weight} kg</Text>
                <Text style={styles.entryText}>Sets: {entry.sets}</Text>
                {entry.reps && <Text style={styles.entryText}>Reps: {entry.reps}</Text>}
                <Text style={styles.entryText}>Notes: {entry.notes}</Text>
                <Text style={styles.entryText}>
                  Date: {new Date(entry.date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </>
    );
  };

  return (
    <>
      <AppBar
        title={`${route.params.historyGroupName} History`}
        isCanGoBack={true}
      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
        <View style={styles.historySection}>
          {historyData.length > 0 ? (
            renderHistoryEntries(historyData)
          ) : (
            <Text style={styles.noDataText}>No history available for this exercise.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 10,
  },
  historySection: {
    marginVertical: 15,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  exerciseContainer: {
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1F2937"
  },
  historyEntry: {
    marginBottom: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#E5E7EB"
  },
  entryText: {
    fontSize: 14,
    color: "#4B5563"
  },
  noDataText: {
    fontSize: 14,
    color: "#6B7280"
  },
});

export default ViewHistory;
