import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fragment, useEffect, useState } from "react";
import AppBar from "@/components/AppBar/AppBar";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Home: undefined;
  AnalysisScreen: { muscle: string };
  MuscleScreen: { muscle: string };
  NewMuscle: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const [muscles, setMuscles] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    fetchMuscles();
  }, []);

  const fetchMuscles = async () => {
    const result = await AsyncStorage.getItem("muscles");
    if (result) {
      const fetchedMuscles = JSON.parse(result);
      setMuscles(fetchedMuscles);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMuscles();
    setRefreshing(false);
  };

  const handleAnalyze = (muscle: string) => {
    navigation.navigate("AnalysisScreen", { muscle });
  };

  const handleDelete = (muscle: any) => {
    Alert.alert(
      "Delete Muscle",
      `Are you sure you want to delete ${muscle.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const result = await AsyncStorage.getItem("muscles");
            if (result) {
              const updatedMuscles = JSON.parse(result).filter(
                (m: any) => m.name !== muscle.name
              );
              await AsyncStorage.setItem(
                "muscles",
                JSON.stringify(updatedMuscles)
              );
              setMuscles(updatedMuscles);
            }
          },
        },
      ]
    );
  };

  const renderMuscleItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("MuscleScreen", { muscle: item.name })}
      style={styles.muscleCard}
    >
      <Image source={{ uri: item.imageUri }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.muscleText}>{item.name}</Text>
        {item.subtitle && (
          <Text style={styles.muscleTextSubTitle}>{item.subtitle}</Text>
        )}
      </View>
      <View style={styles.iconContainer2}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleAnalyze(item.name)}
        >
          <Icon name="bar-chart" size={24} color="#1d4ed8" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleDelete(item)}
        >
          <Icon name="delete" size={24} color="#f00" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <AppBar title="Muscles" isCanGoBack={false} />
      <FlatList
        style={styles.container}
        data={muscles}
        renderItem={renderMuscleItem}
        keyExtractor={(item) => item.name}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        numColumns={2} // Add this to maintain the 2-column layout
        contentContainerStyle={styles.muscleContainer} // Adjust content container style if needed
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  muscleContainer: {
    padding: 10,
  },
  muscleCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
    padding: 15,
    marginHorizontal: "1%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 15,
    marginRight: 15,
  },
  info: {
    marginEnd: 10,
  },
  muscleText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
  },
  muscleTextSubTitle: {
    fontSize: 14,
    color: "#000",
    fontWeight: "400",
  },
  iconContainer2: {
    width: "100%",
    marginTop: 10,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
  },
});
