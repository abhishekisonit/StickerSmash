import { View, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import * as Location from 'expo-location';
import MapView, { Marker } from "react-native-maps";
import Button from "./Button";
import React from "react";

type LocationPickerProps = {
    onLocationSelect: (location: { latitude: number, longitude: number }) => void;
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
    const [pickedLocation, setPickedLocation] = useState<{ latitude: number, longitude: number } | null>(null);

    useEffect(() => {
        (async () => {
            console.log('Requesting location permissions...');
            let { status } = await Location.requestForegroundPermissionsAsync();
            console.log('Location permission status:', status);
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync();
            if (location) {
                console.log('Current location fetched:', location);
                setPickedLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
            }
        })();
    }, []);

    useEffect(() => {
        if (pickedLocation) {
            console.log('Picked location updated:', pickedLocation);
        }
    }, [pickedLocation]);

    const handleLocationSelect = () => {
        if (pickedLocation) {
            console.log('Location selected for submission:', pickedLocation);
            onLocationSelect(pickedLocation);
        }
    }
    return (
        <View style={styles.container}>
            {pickedLocation && (
                <>
                    {console.log('Rendering MapView with pickedLocation:', pickedLocation)}
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            ...pickedLocation,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01
                        }}
                        onPress={(e) => {
                            console.log('Map pressed at:', e.nativeEvent.coordinate);
                            setPickedLocation({
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude
                            });
                        }}
                    >
                        <Marker
                            coordinate={pickedLocation}
                            title="Picked Location"
                        />
                    </MapView>
                </>
            )}
            <Button theme="primary" label="Select Location" onPress={handleLocationSelect} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    map: {
        width: '50%',
        height: '50%',
        zIndex: 1000
    }
})
