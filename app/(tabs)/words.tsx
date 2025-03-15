import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";

// Types
interface SensorReading {
    timestamp: number;
    location?: {
        latitude: number;
        longitude: number;
    };
    magnetometer?: {
        x: number;
        y: number;
        z: number;
    };
}

interface Baseline {
    location: {
        latitude: number;
        longitude: number;
    };
    magnetometer: {
        x: number;
        y: number;
        z: number;
    };
    timestamp: number;
}

interface MovingAverage {
    location: {
        latitude: number;
        longitude: number;
    };
    magnetometer: {
        x: number;
        y: number;
        z: number;
    };
    sampleCount: number;
    timestamp: number;
}

// Constants
const SAMPLE_INTERVAL = 100; // 100ms between readings
const BASELINE_DURATION = 10000; // 30 seconds for baseline collection
const CLEANUP_INTERVAL = 5000; // 10 seconds between cleanups
const EXPECTED_SAMPLES = BASELINE_DURATION / SAMPLE_INTERVAL;

// Helper function for timestamp formatting
const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3
    });
};

export default function SensorMonitor() {
    // State for UI updates
    const [phase, setPhase] = useState<'initializing' | 'collecting' | 'monitoring'>('initializing');
    const [sampleCount, setSampleCount] = useState(0);
    const [baseline, setBaseline] = useState<Baseline | null>(null);
    const [currentReading, setCurrentReading] = useState<SensorReading | null>(null);
    const [lastCleanup, setLastCleanup] = useState<number>(Date.now());
    const [movingAverage, setMovingAverage] = useState<MovingAverage | null>(null);

    // Refs for data collection
    const readings = useRef<SensorReading[]>([]);
    const baselineTimeout = useRef<NodeJS.Timeout | null>(null);
    const movingAverageInterval = useRef<NodeJS.Timeout | null>(null);

    const clearReadings = () => {
        const now = Date.now();
        console.warn(`🧹 Clearing readings buffer at ${formatTimestamp(now)}`);
        console.warn(`   Buffer size before clear: ${readings.current.length} samples`);
        readings.current = [];
        setSampleCount(0);
        setLastCleanup(now);
    };

    const calculateMovingAverage = () => {
        const now = Date.now();
        const tenSecondsAgo = now - 10000;
        const recentReadings = readings.current.filter(r => r.timestamp > tenSecondsAgo);

        if (recentReadings.length === 0) {
            console.warn("No readings in the last 10 seconds");
            return null;
        }

        const validLocationSamples = recentReadings.filter(s => s.location);
        const validMagnetometerSamples = recentReadings.filter(s => s.magnetometer);

        if (validLocationSamples.length === 0 || validMagnetometerSamples.length === 0) {
            console.warn("Missing sensor data in recent readings");
            return null;
        }

        const locationAvg = {
            latitude: validLocationSamples.reduce((sum, s) => sum + s.location!.latitude, 0) / validLocationSamples.length,
            longitude: validLocationSamples.reduce((sum, s) => sum + s.location!.longitude, 0) / validLocationSamples.length
        };

        const magnetometerAvg = {
            x: validMagnetometerSamples.reduce((sum, s) => sum + s.magnetometer!.x, 0) / validMagnetometerSamples.length,
            y: validMagnetometerSamples.reduce((sum, s) => sum + s.magnetometer!.y, 0) / validMagnetometerSamples.length,
            z: validMagnetometerSamples.reduce((sum, s) => sum + s.magnetometer!.z, 0) / validMagnetometerSamples.length
        };

        const average: MovingAverage = {
            location: locationAvg,
            magnetometer: magnetometerAvg,
            sampleCount: recentReadings.length,
            timestamp: now
        };

        // Calculate differences from baseline if available
        if (baseline) {
            // Calculate distance between locations using Haversine formula
            const R = 6371e3; // Earth's radius in meters
            const φ1 = baseline.location.latitude * Math.PI / 180;
            const φ2 = locationAvg.latitude * Math.PI / 180;
            const Δφ = (locationAvg.latitude - baseline.location.latitude) * Math.PI / 180;
            const Δλ = (locationAvg.longitude - baseline.location.longitude) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // in meters

            // Calculate magnetometer differences
            const magDiff = {
                x: Math.abs(magnetometerAvg.x - baseline.magnetometer.x),
                y: Math.abs(magnetometerAvg.y - baseline.magnetometer.y),
                z: Math.abs(magnetometerAvg.z - baseline.magnetometer.z)
            };

            console.warn(`📊 10-Second Moving Average at ${formatTimestamp(now)}:
🔍 Comparison with Baseline:
   Location:
   • Current:  ${locationAvg.latitude.toFixed(6)}, ${locationAvg.longitude.toFixed(6)}
   • Baseline: ${baseline.location.latitude.toFixed(6)}, ${baseline.location.longitude.toFixed(6)}
   • Distance: ${distance.toFixed(2)} meters

   Magnetometer (µT):
   • Current:  X:${magnetometerAvg.x.toFixed(2)}, Y:${magnetometerAvg.y.toFixed(2)}, Z:${magnetometerAvg.z.toFixed(2)}
   • Baseline: X:${baseline.magnetometer.x.toFixed(2)}, Y:${baseline.magnetometer.y.toFixed(2)}, Z:${baseline.magnetometer.z.toFixed(2)}
   • Diff:     X:${magDiff.x.toFixed(2)}, Y:${magDiff.y.toFixed(2)}, Z:${magDiff.z.toFixed(2)}

   Samples: ${recentReadings.length}
`);
        } else {
            console.warn(`📊 10-Second Moving Average at ${formatTimestamp(now)}:`, {
                location: {
                    latitude: locationAvg.latitude.toFixed(6),
                    longitude: locationAvg.longitude.toFixed(6)
                },
                magnetometer: {
                    x: magnetometerAvg.x.toFixed(2),
                    y: magnetometerAvg.y.toFixed(2),
                    z: magnetometerAvg.z.toFixed(2)
                },
                sampleCount: recentReadings.length
            });
        }

        // Clear readings after calculating the moving average
        clearReadings();

        return average;
    };

    const calculateBaseline = () => {
        const samples = readings.current;
        if (samples.length === 0) {
            console.error("❌ No samples collected during baseline period");
            return null;
        }

        // Calculate location averages
        const validLocationSamples = samples.filter(s => s.location);
        const validMagnetometerSamples = samples.filter(s => s.magnetometer);

        if (validLocationSamples.length === 0 || validMagnetometerSamples.length === 0) {
            console.error("❌ Missing sensor data in samples");
            return null;
        }

        const locationAvg = {
            latitude: validLocationSamples.reduce((sum, s) => sum + s.location!.latitude, 0) / validLocationSamples.length,
            longitude: validLocationSamples.reduce((sum, s) => sum + s.location!.longitude, 0) / validLocationSamples.length
        };

        const magnetometerAvg = {
            x: validMagnetometerSamples.reduce((sum, s) => sum + s.magnetometer!.x, 0) / validMagnetometerSamples.length,
            y: validMagnetometerSamples.reduce((sum, s) => sum + s.magnetometer!.y, 0) / validMagnetometerSamples.length,
            z: validMagnetometerSamples.reduce((sum, s) => sum + s.magnetometer!.z, 0) / validMagnetometerSamples.length
        };

        return {
            location: locationAvg,
            magnetometer: magnetometerAvg,
            timestamp: Date.now()
        };
    };

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;
        let magnetometerSubscription: { remove: () => void } | null = null;

        const initializeSensors = async () => {
            console.warn("🚀 Starting sensor initialization...");

            // Request location permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error("❌ Location permission denied");
                return;
            }

            // Configure sensors
            await Magnetometer.setUpdateInterval(SAMPLE_INTERVAL);
            console.warn("✅ Sensors configured");

            // Clear any existing data
            clearReadings();
            setPhase('collecting');

            console.warn(`📊 Starting baseline collection (${BASELINE_DURATION / 1000} seconds)...`);

            // Subscribe to magnetometer
            magnetometerSubscription = Magnetometer.addListener(reading => {
                const timestamp = Date.now();
                const currentSample: SensorReading = {
                    timestamp,
                    magnetometer: reading
                };
                readings.current.push(currentSample);
                setCurrentReading(prev => ({ ...prev, ...currentSample }));
                setSampleCount(readings.current.length);
            });

            // Subscribe to location
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: SAMPLE_INTERVAL,
                    distanceInterval: 0
                },
                position => {
                    const timestamp = Date.now();
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    const currentSample: SensorReading = {
                        timestamp,
                        location: locationData
                    };
                    readings.current.push(currentSample);
                    setCurrentReading(prev => ({ ...prev, ...currentSample }));
                    setSampleCount(readings.current.length);
                }
            );

            // Set timeout for baseline calculation
            baselineTimeout.current = setTimeout(() => {
                console.warn("⏱️ Baseline collection period complete");
                console.warn(`📊 Collected ${readings.current.length} samples (Expected: ${EXPECTED_SAMPLES})`);

                const baselineResult = calculateBaseline();
                if (baselineResult) {
                    setBaseline(baselineResult);
                    console.warn(`✅ Baseline established at ${formatTimestamp(baselineResult.timestamp)}:`, {
                        location: {
                            latitude: baselineResult.location.latitude.toFixed(6),
                            longitude: baselineResult.location.longitude.toFixed(6)
                        },
                        magnetometer: {
                            x: baselineResult.magnetometer.x.toFixed(2),
                            y: baselineResult.magnetometer.y.toFixed(2),
                            z: baselineResult.magnetometer.z.toFixed(2)
                        },
                        sampleCount: readings.current.length
                    });
                    setPhase('monitoring');

                    // Start moving average calculation
                    movingAverageInterval.current = setInterval(() => {
                        const average = calculateMovingAverage();
                        if (average) {
                            setMovingAverage(average);
                        }
                    }, CLEANUP_INTERVAL);
                } else {
                    console.error("❌ Failed to establish baseline");
                    setPhase('initializing');
                }
            }, BASELINE_DURATION);
        };

        initializeSensors();

        return () => {
            locationSubscription?.remove();
            magnetometerSubscription?.remove();
            if (baselineTimeout.current) {
                clearTimeout(baselineTimeout.current);
            }
            if (movingAverageInterval.current) {
                clearInterval(movingAverageInterval.current);
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.phase}>Phase: {phase}</Text>

            {phase === 'collecting' && (
                <View style={styles.card}>
                    <Text style={styles.title}>Baseline Collection</Text>
                    <Text style={styles.detail}>
                        Progress: {((sampleCount / EXPECTED_SAMPLES) * 100).toFixed(1)}%
                        {'\n'}Samples: {sampleCount} / {EXPECTED_SAMPLES}
                        {'\n'}Time Remaining: {Math.max(0, BASELINE_DURATION - (sampleCount * SAMPLE_INTERVAL)) / 1000}s
                    </Text>
                </View>
            )}

            {baseline && (
                <View style={styles.card}>
                    <Text style={styles.title}>Baseline Values</Text>
                    <Text style={styles.detail}>
                        Location: {baseline.location.latitude.toFixed(6)}, {baseline.location.longitude.toFixed(6)}
                        {'\n'}Magnetometer (µT):
                        {'\n'}X: {baseline.magnetometer.x.toFixed(2)}
                        {'\n'}Y: {baseline.magnetometer.y.toFixed(2)}
                        {'\n'}Z: {baseline.magnetometer.z.toFixed(2)}
                        {'\n'}Last Cleanup: {formatTimestamp(lastCleanup)}
                    </Text>
                </View>
            )}

            {movingAverage && phase === 'monitoring' && (
                <View style={styles.card}>
                    <Text style={styles.title}>10-Second Moving Average</Text>
                    <Text style={styles.detail}>
                        Location: {movingAverage.location.latitude.toFixed(6)}, {movingAverage.location.longitude.toFixed(6)}
                        {'\n'}Magnetometer (µT):
                        {'\n'}X: {movingAverage.magnetometer.x.toFixed(2)}
                        {'\n'}Y: {movingAverage.magnetometer.y.toFixed(2)}
                        {'\n'}Z: {movingAverage.magnetometer.z.toFixed(2)}
                        {'\n'}Samples: {movingAverage.sampleCount}
                        {'\n'}Time: {formatTimestamp(movingAverage.timestamp)}
                    </Text>
                </View>
            )}

            {currentReading && (
                <View style={styles.card}>
                    <Text style={styles.title}>Current Reading</Text>
                    <Text style={styles.detail}>
                        {currentReading.location && `Location: ${currentReading.location.latitude.toFixed(6)}, ${currentReading.location.longitude.toFixed(6)}\n`}
                        {currentReading.magnetometer && `Magnetometer (µT):\nX: ${currentReading.magnetometer.x.toFixed(2)}\nY: ${currentReading.magnetometer.y.toFixed(2)}\nZ: ${currentReading.magnetometer.z.toFixed(2)}`}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    phase: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    detail: {
        fontSize: 16,
        lineHeight: 24,
    }
});