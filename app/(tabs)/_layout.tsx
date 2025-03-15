import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: "#ffd33d",
            headerStyle: {
                backgroundColor: "#25292e"
            },
            headerShadowVisible: false,
            headerTintColor: "#fff",
            tabBarStyle: {
                backgroundColor: "#25292e"
            }
        }}>
            <Tabs.Screen name="index" options={{
                title: "Home",
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? "home-sharp" : "home-outline"} color={color} size={28} />
                )
            }} />
            <Tabs.Screen name="words" options={{
                title: "Words",
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? "text-sharp" : "text-outline"} color={color} size={28} />
                )
            }} />
            <Tabs.Screen name="words2" options={{
                title: "Words",
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? "text-sharp" : "text-outline"} color={color} size={28} />
                )
            }} />
            <Tabs.Screen name="about" options={{
                title: "About",
                tabBarIcon: ({ color, focused }) => (
                    <Ionicons name={focused ? "information-circle-sharp" : "information-circle-outline"} color={color} size={28} />
                )
            }} />
        </Tabs>
    );
}