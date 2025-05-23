// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/loginScreen'; // Login screen
import HomeScreen from './screens/HomeScreen'; // Placeholder screen
import MapScreen from './components/mapScreen'; // Placeholder screen
import BottomNavbar from './components/buttomNav';
import LocationTracker from './components/locationTracker'; // Location tracking component

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
      </Stack.Navigator>
      <LocationTracker />
    </NavigationContainer>
    
    
  );
}
