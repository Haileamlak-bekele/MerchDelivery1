// screens/HomeScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocationTracker from '../components/locationTracker';
import { MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [isTracking, setIsTracking] = useState(true);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  const toggleTracking = () => {
    setIsTracking(prev => !prev);
    // You could also add logic to start/stop location updates here
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isTracking && <LocationTracker />}

      {/* Header */}
      <View style={styles.headerContainer}>
      <Image
          source={{ uri: 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <Text style={styles.title}>Welcome, DSP 👋</Text>
      </View>

      {/* Location Tracking Card */}
      <TouchableOpacity style={styles.cardSquare} activeOpacity={0.8} onPress={toggleTracking}>
        <MaterialIcons name="location-on" size={40} color="#4caf50" />
        <Text style={styles.cardTitle}>Location Tracking</Text>
        <Text style={styles.cardText}>
          {isTracking ? 'Your location is currently active.' : 'Location tracking is stopped.'}
        </Text>
        <View style={styles.button}>
          <Text style={styles.buttonText}>{isTracking ? 'Stop Tracking' : 'Start Tracking'}</Text>
        </View>
      </TouchableOpacity>

      {/* Delivery Tasks Card */}
      <TouchableOpacity style={styles.cardSquare} activeOpacity={0.8}>
        <FontAwesome5 name="truck" size={40} color="#2196f3" />
        <Text style={styles.cardTitle}>My Deliveries</Text>
        <Text style={styles.cardText}>- Order #12345 - 2.3 km away</Text>
        <Text style={styles.cardText}>- Order #12346 - 5.1 km away</Text>
        <View style={styles.button}><Text style={styles.buttonText}>View All Deliveries</Text></View>
      </TouchableOpacity>

      {/* Earnings Card */}
      <View style={styles.cardSquare}>
        <Entypo name="credit" size={40} color="#ff9800" />
        <Text style={styles.cardTitle}>Today’s Earnings</Text>
        <Text style={styles.cardText}>Total: 350 ETB</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f2f2f2',
    flexGrow: 1,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardSquare: {
    width: 300,
    height: 300,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 10,
    color: '#333',
    textAlign: 'center',
  },
  cardText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 2,
  },
  button: {
    marginTop: 15,
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#e53935',
  },
});
