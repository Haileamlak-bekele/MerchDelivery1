// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/loginScreen'; // Login screen
import HomeScreen from './screens/HomeScreen'; // Placeholder screen
import MapScreen from './components/mapScreen'; // Placeholder screen
import BottomNavbar from './components/buttomNav';
import LocationTracker from './components/locationTracker'; // Location tracking component
import profile from './screens/ProfileScreen'; // Profile screen
import chat from './components/chatComponent'; // Chat component

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
        <Stack.Screen name="Profile" component={profile} />
        <Stack.Screen name="Chat" component={chat} />
      </Stack.Navigator>
      <LocationTracker />
    </NavigationContainer>
    
    
  );
}
