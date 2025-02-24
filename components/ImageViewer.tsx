import { Image, ImageSource } from "expo-image";
import { StyleSheet } from "react-native";
type ImageViewerProps = {
    imageSource: ImageSource,
}

export default function ImageViewer({ imageSource }: ImageViewerProps) {
    return (
        <Image source={imageSource} style={styles.image} />
    )
}

const styles = StyleSheet.create({
    image: {
        width: 320,
        height: 400,
        borderRadius: 18,
    },
})

