import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function NotFound() {
    return (
        <View style={styles.container}>
            <Text>This screen doesn't exist.</Text>
            <Link href="/" style={styles.button}>
                <Text style={styles.buttonText}>Go to home!</Text>
            </Link>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#25292e",
        gap: 10
    },
    button: {
        padding: 10,
        backgroundColor: "#000",
        borderRadius: 5
    },
    buttonText: {
        color: "#fff"
    }
});

