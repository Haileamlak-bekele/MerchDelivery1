import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 600;

const GOOGLE_MAPS_APIKEY = 'AIzaSyA7WjmOJXI06NhxctNMkw5UE7w33LYk5bc';

const MapWithRoute = ({ route }) => {
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [coords, setCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null });
  const locationSubscription = useRef(null);

  // Destructure all params passed from HomeScreen
  const {
    pickupLocation,
    dropoffLocation,
    customerName,
    customerPhone,
    dropoffAddress,
    orderId,
    items,
    totalAmount,
    orderStatus,
    createdAt,
  } = route.params;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

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

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation && pickupLocation && dropoffLocation) {
      fetchRoute();
    }
    // eslint-disable-next-line
  }, [userLocation, pickupLocation, dropoffLocation]);

  const fetchRoute = async () => {
    const origin = `${userLocation.latitude},${userLocation.longitude}`;
    const waypoint = `${pickupLocation.lat},${pickupLocation.lng}`;
    const dest = `${dropoffLocation.lat},${dropoffLocation.lng}`;

    // Directions API: origin -> waypoint (pickup) -> destination (dropoff)
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&waypoints=${waypoint}&mode=driving&key=${GOOGLE_MAPS_APIKEY}`;

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
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;
        });

        setRouteInfo({
          distance: (totalDistance / 1000).toFixed(2),
          duration: Math.round(totalDuration / 60),
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

  const formatItems = (items) => {
    if (!items) return '';
    return items.map(i => `${i.product?.name || 'Item'} x${i.quantity}`).join(', ');
  };

  if (!region) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Map in a box */}
      <View style={styles.mapBox}>
        <MapView
          style={styles.map}
          region={region}
          zoomControlEnabled={true}
          showsUserLocation={true}
        >
          {/* Current Location Marker */}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />
          )}
          {/* Pickup Marker */}
          {pickupLocation && (
            <Marker
              coordinate={{ latitude: pickupLocation.lat, longitude: pickupLocation.lng }}
              title="Pickup Location"
              pinColor="orange"
            />
          )}
          {/* Dropoff Marker */}
          {dropoffLocation && (
            <Marker
              coordinate={{ latitude: dropoffLocation.lat, longitude: dropoffLocation.lng }}
              title="Dropoff Location"
              pinColor="green"
            />
          )}
          {/* Route Polyline */}
          {coords.length > 0 && (
            <Polyline
              coordinates={coords}
              strokeWidth={4}
              strokeColor="blue"
            />
          )}
        </MapView>
        {routeInfo.distance && routeInfo.duration && (
          <View style={styles.routeInfoOverlay}>
            <Text style={styles.routeText}>
              Distance: {routeInfo.distance} km | Duration: {routeInfo.duration} min
            </Text>
          </View>
        )}
      </View>
      {/* Order Details below the map */}
      <View style={styles.detailsBox}>
        <Text style={styles.detailsTitle}>Order Details</Text>
        <Text style={styles.detailsText}><Text style={styles.bold}>Order ID:</Text> {orderId}</Text>
        <Text style={styles.detailsText}><Text style={styles.bold}>Status:</Text> {orderStatus}</Text>
        <Text style={styles.detailsText}><Text style={styles.bold}>Placed At:</Text> {createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}</Text>
        <Text style={styles.detailsText}><Text style={styles.bold}>Customer:</Text> {customerName || 'N/A'}</Text>
        <Text style={styles.detailsText}><Text style={styles.bold}>Customer Phone:</Text> {customerPhone || 'N/A'}</Text>
        <Text style={styles.detailsText}><Text style={styles.bold}>Pickup Location:</Text> {pickupLocation ? `${pickupLocation.lat}, ${pickupLocation.lng}` : 'N/A'}</Text>
        <Text style={styles.detailsText}><Text style={styles.bold}>Dropoff Location:</Text> {dropoffLocation ? `${dropoffLocation.lat}, ${dropoffLocation.lng}` : 'N/A'}</Text>
        <Text style={styles.detailsText}><Text style={styles.bold}>Dropoff Address:</Text> {dropoffAddress || 'N/A'}</Text>
        <Text style={styles.detailsText}><Text style={styles.bold}>Items:</Text> {formatItems(items)}</Text>
        <Text style={styles.detailsText}><Text style={styles.bold}>Total Amount:</Text> ${totalAmount?.toFixed(2) || '0.00'}</Text>
      </View>
    </ScrollView>
  );
};

export default MapWithRoute;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 0,
    backgroundColor: '#f6f9fc',
    alignItems: 'center',
    minHeight: '100%',
  },
  mapBox: {
    width: width - 32,
    height: MAP_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: 24,
    marginBottom: 18,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  routeInfoOverlay: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: 6,
    marginHorizontal: 16,
    borderRadius: 8,
    zIndex: 2,
    elevation: 2,
  },
  routeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2980b9',
  },
  detailsBox: {
    width: width - 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: 'center',
  },
  detailsTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#2980b9',
  },
  detailsText: {
    fontSize: 14,
    marginBottom: 2,
    color: '#333',
  },
  bold: { fontWeight: 'bold' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});