import { Image, ImageSource } from "expo-image";
import { StyleSheet, View, Text } from "react-native";
type ImageViewerProps = {
    imageSource: ImageSource,
    location: { latitude: number, longitude: number } | undefined,
}

export default function ImageViewer({ imageSource, location }: ImageViewerProps) {
    console.log('Location:', location);
    console.log('Image source:', imageSource);
    return (
        <View style={styles.container}>
            <Image source={imageSource} style={styles.image} />
            {location && (
                <View style={styles.locationContainer}>
                    <Text style={styles.locationText}>
                        {location.latitude}, {location.longitude}
                    </Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 320,
        height: 400,
        borderRadius: 18,
    },
    image: {
        width: 320,
        height: 400,
        borderRadius: 18,
    },
    locationContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 20,
    },
    locationText: {
        fontSize: 12,
        color: 'black',
    },
})

