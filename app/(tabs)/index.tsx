import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Index() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>StickerSmash</Text>
            <Link href="/(tabs)/about" style={styles.button}>
                <Text style={styles.buttonText}>About</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#25292e",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    button: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: "#25292e",
        fontWeight: "bold",
    },
}); 