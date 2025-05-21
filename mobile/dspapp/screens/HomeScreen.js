import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DSPDashboard = () => {
  const navigation = useNavigation();

  const [activeDelivery, setActiveDelivery] = useState(null);
  const [incomingDelivery, setIncomingDelivery] = useState({
    items: '2 Pizzas, 1 Soda',
    pickup: 'Restaurant A, 123 Main St',
    dropoff: 'Customer X, 456 Oak Ave',
    price: '$8.50',
    distance: '2.5 km',
  });

  const handleAccept = () => {
    setActiveDelivery(incomingDelivery);
    setIncomingDelivery(null);
  };

  const handleReject = () => {
    setIncomingDelivery(null);
  };
   const handleNavigate = () => {
    navigation.navigate('MapScreen');
   }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🚚 DSP Dashboard</Text>
        <View style={styles.profileIcon}>
          <Text style={styles.profileText}>👤</Text>
        </View>
      </View>
      

      <ScrollView contentContainerStyle={styles.content}>
        {/* Active Delivery Section */}
        <Text style={styles.sectionTitle}>Active Delivery</Text>
        {activeDelivery ? (
          <View style={styles.deliveryCard}>
            <Text style={styles.itemTitle}>
              <Text style={styles.link}>{activeDelivery.items}</Text>
            </Text>
            <Text style={styles.info}><Text style={styles.bold}>Pickup:</Text> {activeDelivery.pickup}</Text>
            <Text style={styles.info}><Text style={styles.bold}>Dropoff:</Text> {activeDelivery.dropoff}</Text>

            <View style={styles.deliveryFooter}>
              <View>
                <Text style={styles.price}>{activeDelivery.price}</Text>
                <Text style={styles.distance}>{activeDelivery.distance}</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('MapScreen')}>
                <Text style={styles.buttonText}>🧭 Navigate</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.chatButton} onPress={() => console.log('Chat with Customer')}>
                <Text style={styles.buttonText}>💬 Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmButton} onPress={() => console.log('Pickup Confirmed')}>
                <Text style={styles.buttonText}>✔ Confirm Pickup</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noDeliveryCard}>
            <Text style={styles.noDeliveryIcon}>📦</Text>
            <Text style={styles.noDeliveryTitle}>No Active Delivery</Text>
            <Text style={styles.noDeliverySubtitle}>Waiting for your next assignment.</Text>
          </View>
        )}

        {/* Incoming Delivery Section */}
        {incomingDelivery && (
          <>
            <Text style={styles.sectionTitle}>Incoming Deliveries</Text>
            <View style={styles.deliveryCard}>
              <Text style={styles.itemTitle}>
                <Text style={styles.link}>{incomingDelivery.items}</Text>
              </Text>
              <Text style={styles.info}><Text style={styles.bold}>Pickup:</Text> {incomingDelivery.pickup}</Text>
              <Text style={styles.info}><Text style={styles.bold}>Dropoff:</Text> {incomingDelivery.dropoff}</Text>

              <View style={styles.deliveryFooter}>
                <View>
                  <Text style={styles.price}>{incomingDelivery.price}</Text>
                  <Text style={styles.distance}>{incomingDelivery.distance}</Text>
                </View>

                <View style={styles.buttons}>
                  <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                    <Text style={styles.buttonText}>✓ Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                    <Text style={styles.buttonText}>✕ Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default DSPDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f9fc' },

  header: {
    backgroundColor: '#0080d6',
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  profileIcon: {
    backgroundColor: '#4cd137',
    borderRadius: 10,
    padding: 8,
  },
  profileText: { fontSize: 18, color: '#fff' },

  content: { padding: 16 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },

  noDeliveryCard: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
  },
  noDeliveryIcon: { fontSize: 36, color: '#95a5a6' },
  noDeliveryTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  noDeliverySubtitle: { fontSize: 14, color: '#7f8c8d' },

  deliveryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  itemTitle: { fontSize: 16, color: '#2980b9', marginBottom: 6 },
  link: { color: '#2980b9', textDecorationLine: 'underline' },
  info: { fontSize: 14, marginBottom: 4 },
  bold: { fontWeight: 'bold' },

  deliveryFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontSize: 18, fontWeight: 'bold', color: 'green' },
  distance: { fontSize: 14, color: '#7f8c8d' },

  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },

  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
    flexWrap: 'wrap',
  },

  navButton: {
    backgroundColor: '#2980b9',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },

  chatButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },

  confirmButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
});
