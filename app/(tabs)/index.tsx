import { View, StyleSheet, Text } from "react-native";
import { useState } from "react";
import ImageViewer from "@/components/ImageViewer";
import Button from "@/components/Button";
import * as ImagePicker from 'expo-image-picker';
import { ImageSource } from "expo-image";
import LocationPicker from "@/components/LocationPicker";
import React from "react";

const PlaceHolderImage = require('@/assets/images/background-image.png')

export default function Index() {

    const [selectedImage, setSelectedImage] = useState<ImageSource | undefined>(undefined);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | undefined>(undefined);
    const [isPickingLocation, setIsPickingLocation] = useState(false);


    const pickImageAsync = async () => {
        console.log('Opening image picker...');
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        })
        console.log('Image picker result:', result);
        if (!result.canceled) {
            setSelectedImage({ uri: result.assets[0].uri });
            console.log('Selected image URI:', result.assets[0].uri);
            setIsPickingLocation(true);
        } else {
            alert("You need to provide a photo");
        }
    }

    const handleLocationSelect = (selectedLocation: { latitude: number, longitude: number }) => {
        console.log('Location selected:', selectedLocation);
        setLocation(selectedLocation);
        setIsPickingLocation(false);
    }

    console.log('Is picking location:', isPickingLocation);
    console.log('Current location:', location);

    return (
        <View style={styles.container}>
            {isPickingLocation ? (
                <LocationPicker onLocationSelect={handleLocationSelect} />
            ) : (
                <>
                    <View style={styles.imageContainer}>
                        <ImageViewer imageSource={selectedImage || PlaceHolderImage} location={location} />
                    </View>
                    <View style={styles.footerContainer}>
                        <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
                        <Button label="Use this photo" />
                    </View>
                </>
            )}
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