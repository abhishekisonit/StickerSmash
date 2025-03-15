import React, { useState, useEffect } from 'react';
import { View, Button, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';

const LocationPickerNew = () => {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isFetching, setIsFetching] = useState(false);

    // Get User's Current Location
    const getCurrentLocation = async () => {
        setIsFetching(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location access is required to pick a location.');
            setIsFetching(false);
            return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        setIsFetching(false);
    };

    // Handle Map Click to Select Location
    const selectLocationHandler = (event: MapPressEvent) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setLocation({ lat: latitude, lng: longitude });
    };

    return (
        <View style={{ flex: 1 }}>
            <Button title="Get Current Location" onPress={getCurrentLocation} />
            {isFetching ? <ActivityIndicator size="large" color="blue" /> : null}

            {location && (
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: location.lat,
                        longitude: location.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    onPress={selectLocationHandler}
                >
                    {location && <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} />}
                </MapView>
            )}

            {location && <Text>Selected Location: {location.lat}, {location.lng}</Text>}
        </View>
    );
};

export default LocationPickerNew;
