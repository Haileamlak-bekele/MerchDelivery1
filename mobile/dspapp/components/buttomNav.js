import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import profile from '../screens/ProfileScreen'; // Importing ProfileScreen for navigation

const BottomNavbar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.navItem}>📋 Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('MapScreen')}>
        <Text style={styles.navItem}>📍 Map</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
        <Text style={styles.navItem}>💬 Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        {/* Ensure 'Profile' matches the name used in your navigation stack */}
        <Text style={styles.navItem}>👤 Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2ecc71',
    paddingVertical: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    color: '#ecf0f1',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default BottomNavbar;
