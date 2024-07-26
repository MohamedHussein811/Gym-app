import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

interface AppBarProps {
    title: string;
    isCanGoBack: boolean;
    onBackPress?: () => void;
}
const AppBar: React.FC<AppBarProps> = ({ title, isCanGoBack, onBackPress }) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={{ paddingTop: insets.top }}>
            <View style={[styles.appBar, { paddingHorizontal: insets.left + 10, paddingRight: insets.right + 10 }]}>
                {isCanGoBack && (
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color={"black"} />
                    </TouchableOpacity>
                )}
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={() => navigation.navigate("NewMuscle" as never)}>
                    <View style={styles.iconContainerWrapper}>
                        <View style={styles.iconContainer}>
                            <Icon
                                name="add"
                                size={30}
                                color="#1d4ed8"
                                style={styles.addIcon}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    appBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 60,
        backgroundColor: "#e5e7eb",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "left",
        flex: 1,
        color: "#000",
    },
    backButton: {
        textAlign: "left",
        flex: 0,
        padding: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: "#000",
    },
    iconContainerWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    iconContainer: {
        borderRadius: 15,
        backgroundColor: "#f0f4ff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    addIcon: {
        fontSize: 35,
        color: "#000",
        fontWeight: "bold",
    },
});

export default AppBar;
