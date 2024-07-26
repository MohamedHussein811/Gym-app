import { TouchableOpacity,Text,StyleSheet } from "react-native";
export default function CustomButton({title, onPress}:any) {
    return (
        <TouchableOpacity
            style={styles.style}
            onPress={onPress}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    style: {
        backgroundColor: "#000" ,
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center',
        alignItems: 'center',
    },
    text:{
        color: "#fff",
        fontSize: 16,
        fontWeight: 'bold',
    }
});
