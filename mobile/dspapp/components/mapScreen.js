import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';

const GOOGLE_MAPS_APIKEY = 'AIzaSyA7WjmOJXI06NhxctNMkw5UE7w33LYk5bc';

// Example waypoints array (add more if needed)
const waypoints = [
  // { latitude: 9.0, longitude: 38.7 },
  // { latitude: 8.9, longitude: 38.8 }
];

const MapWithRoute = () => {
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [coords, setCoords] = useState([]);
  const [destination, setDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null });
  const locationSubscription = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      // Subscribe to location updates
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (location) => {
          setUserLocation(location.coords);
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      );
    })();

    // Cleanup on unmount
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation && destination) {
      fetchRoute();
    }
  }, [userLocation, destination]);

  const fetchRoute = async () => {
    const origin = `${userLocation.latitude},${userLocation.longitude}`;
    const dest = `${destination.latitude},${destination.longitude}`;

    // Build waypoints string if any
    let waypointsStr = '';
    if (waypoints.length > 0) {
      waypointsStr = waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|');
    }

    // Add optimize:true if there are waypoints
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=driving&key=${GOOGLE_MAPS_APIKEY}`;
    if (waypointsStr) {
      url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&waypoints=optimize:true|${waypointsStr}&mode=driving&key=${GOOGLE_MAPS_APIKEY}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const routeCoords = points.map(point => ({
          latitude: point[0],
          longitude: point[1],
        }));

        setCoords(routeCoords);

        // Calculate total distance and duration
        let totalDistance = 0;
        let totalDuration = 0;
        data.routes[0].legs.forEach(leg => {
          totalDistance += leg.distance.value; // in meters
          totalDuration += leg.duration.value; // in seconds
        });

        setRouteInfo({
          distance: (totalDistance / 1000).toFixed(2), // km
          duration: Math.round(totalDuration / 60), // minutes
        });
      } else {
        setCoords([]);
        setRouteInfo({ distance: null, duration: null });
        Alert.alert('Route not found');
      }
    } catch (error) {
      console.error(error);
      setRouteInfo({ distance: null, duration: null });
      Alert.alert('Error fetching route');
    }
  };

  if (!region) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {routeInfo.distance && routeInfo.duration && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>
            Distance: {routeInfo.distance} km | Duration: {routeInfo.duration} min
          </Text>
        </View>
      )}
      <MapView
        style={styles.map}
        region={region}
        zoomControlEnabled={true}
        showsUserLocation={true}
        onPress={e => {
          setDestination(e.nativeEvent.coordinate);
        }}
      >
        {userLocation && (
          <Marker coordinate={userLocation} title="Your Location" />
        )}
        {destination && (
          <Marker coordinate={destination} title="Destination" pinColor="green" />
        )}
        {coords.length > 0 && (
          <Polyline
            coordinates={coords}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>
    </View>
  );
};

export default MapWithRoute;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  routeInfo: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});