import React, { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationTracker = () => {
  const locationSubscription = useRef(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required!');
        return;
      }

      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        Alert.alert('Error', 'User not logged in or missing credentials');
        return;
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 20,
        },
        (location) => {
          if (!isMounted) return;
          const { latitude, longitude } = location.coords;

          fetch('http://192.168.217.121:5000/dsp/location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, latitude, longitude }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log('Location sent successfully:', data);
            })
            .catch((error) => {
              console.error('Error sending location:', error);
            });
        }
      );
    })();

    return () => {
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  return null;
};

export default LocationTracker;