import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        // 1. Fetch DSP profile
        const res = await fetch('http://192.168.188.100:5000/dsp/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const dspData = await res.json();
        console.log('DSP Profile Data:', dspData?.userId);
        if (res.ok && dspData.userId) {
          setProfile(dspData);
          // 2. Fetch user profile using userId from DSP profile
          const userRes = await fetch(`http://192.168.188.100:5000/users/getUserById/${dspData?.userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const userData = await userRes.json();
          if (userRes.ok) {
            setUser(userData);
          } else {
            Alert.alert('Error', userData.message || 'Failed to load user profile');
          }
        } else {
          Alert.alert('Error', dspData.message || 'Failed to load DSP profile');
        }
      } catch (err) {
        Alert.alert('Error', 'Unable to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Profile not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 DSP Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user.name}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{user.phoneNumber}</Text>
        <Text style={styles.label}>Vehicle:</Text>
        <Text style={styles.value}>{profile?.vehicle || 'N/A'}</Text>
      </View>
     <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
  <Text style={styles.buttonText}>Back to Dashboard</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.button, { backgroundColor: '#ef4444', marginTop: 12 }]}
  onPress={async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = user?._id; // get user ID from loaded user profile
      // Send userId in the request body
      const res = await fetch(`http://192.168.188.100:5000/users/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }), // send userId to backend
      });
      const data = await res.json();
      console.log('Logout response:', data);
      // Remove tokens and user data from AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      // Navigate to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      Alert.alert('Error', 'Logout failed. Please try again.');
    }
  }}
>
  <Text style={styles.buttonText}>Logout</Text>
</TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#10b981', marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: { fontWeight: 'bold', color: '#555', marginTop: 8 },
  value: { fontSize: 16, color: '#222', marginBottom: 4 },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 17, letterSpacing: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16 },
});