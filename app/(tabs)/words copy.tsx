import React, { useEffect } from "react";
import { useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Alert } from "react-native";
import * as Location from "expo-location"
import axios from "axios";

const apiKey = 'RJNTMB3U';

export default function What3WordsScreen2() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [threeWords, setThreeWords] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        const fetchLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location access is required to get 3-word addresses.');
                setLoading(false);
                return;
            }

            let lastLocation: { lat: number; lng: number } | null = null;

            // Watch user's location updates
            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1500, distanceInterval: 0 },
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    // if (lastLocation) {
                    //     const distanceMoved = Math.sqrt(
                    //         Math.pow(lat - lastLocation.lat, 2) + Math.pow(lng - lastLocation.lng, 2)
                    //     ) * 111139; // Convert degrees to meters
                    //     setThreeWords(distanceMoved.toString());
                    //     // console.log(`Distance Moved: ${distanceMoved}`);r
                    //     if (distanceMoved < 2) return;
                    // }

                    lastLocation = { lat, lng };
                    console.log("Location updated:", lat, lng);
                    setLocation({ lat, lng });
                    setLoading(false);
                    // fetchWhat3Words(lat, lng);
                }
            );
        };

        fetchLocation();

        // Cleanup subscription on unmount
        return () => {
            if (locationSubscription) locationSubscription.remove();
        };
    }, []);

    const fetchWhat3Words = async (lat: number, lng: number) => {
        try {
            const { data } = await axios.get("https://api.what3words.com/v3/convert-to-3wa", {
                params: { coordinates: `${lat},${lng}`, key: "YOUR_W3W_API_KEY" },
            });
            if (data.words) {
                setThreeWords(data.words);
            } else {
                console.error("Error fetching 3 words:", data);
            }
        } catch (error) {
            console.error("What3Words API Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>What3Words Location</Text>
            {loading ? (
                <ActivityIndicator size="large" color="blue" />
            ) : (
                <>
                    <Text style={styles.text}>Latitude: {location?.lat}</Text>
                    <Text style={styles.text}>Longitude: {location?.lng}</Text>
                    <Text style={styles.words}>{threeWords ? `///${threeWords}` : 'Fetching words...'}</Text>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
    },
    words: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'blue',
    },
});
