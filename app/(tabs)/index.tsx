import { View, StyleSheet } from "react-native";
import { useState } from "react";
import ImageViewer from "@/components/ImageViewer";
import Button from "@/components/Button";
import * as ImagePicker from 'expo-image-picker';
import { ImageSource } from "expo-image";
const PlaceHolderImage = require('@/assets/images/background-image.png')

export default function Index() {

    const [selectedImage, setSelectedImage] = useState<ImageSource | undefined>(undefined);

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        })
        if (!result.canceled) {
            setSelectedImage({ uri: result.assets[0].uri });
        } else {
            alert("You need to provide a photo");
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <ImageViewer imageSource={selectedImage || PlaceHolderImage} />
            </View>
            <View style={styles.footerContainer}>
                <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
                <Button label="Use this photo" />
            </View>
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
    imageContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
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
    footerContainer: {
        flex: 1 / 3,
        alignItems: "center",
    },
}); 