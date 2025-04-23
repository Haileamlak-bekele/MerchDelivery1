// components/LocationTracker.js
import React, { useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationTracker = () => {
  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required!');
        return;
      }

      // Get the token and userId from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      console.log('Token:', token); // Debugging
      console.log('UserID:', userId); // Debugging

      // Check if token and userId are available
      if (!token || !userId) {
        Alert.alert('Error', 'User not logged in or missing credentials');
        return;
      }

      // Watch for location updates every 10 seconds or 20 meters
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 20, // Update every 20 meters
        },
        (location) => {
          const { latitude, longitude } = location.coords;

          // Send location data to backend
          fetch('http://192.168.215.121:5000/dsp/location', {
            method: 'POST', // Use POST here
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
  }, []);

  return null; // This component doesn't need to render anything
};

export default LocationTracker;
