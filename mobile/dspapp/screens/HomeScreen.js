import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DSPDashboard = () => {
  const navigation = useNavigation();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch('http://192.168.217.121:5000/dsp/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Failed to fetch DSP orders:', err);
        setOrders([]);
      }
    };
    fetchOrders();
  }, []);

  const handleAccept = (orderId) => {
    // TODO: POST to backend to update order status to 'SHIPPED'
    setOrders(prev =>
      prev.map(order =>
        order._id === orderId
          ? { ...order, orderStatus: 'SHIPPED' }
          : order
      )
    );
  };

  const handleReject = (orderId) => {
    // Optionally notify backend about rejection
    setOrders(prev => prev.filter(order => order._id !== orderId));
  };

 const handleNavigate = (order) => {
  navigation.navigate('MapScreen', {
    pickupLocation: order.merchant?.location,
    dropoffLocation: order.deliveryLocation,
    customerName: order.customer?.name,
    customerPhone: order.customer?.phoneNumber,
    dropoffAddress: order.deliveryLocation?.address,
    orderId: order._id,
    items: order.items,
    totalAmount: order.totalAmount,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
    // Add any other fields you want to show
  });
};

  const formatItems = (items) => {
    if (!items) return '';
    return items.map(i => `${i.product?.name || 'Item'} x${i.quantity}`).join(', ');
  };

  // Filter orders by status
  const activeDeliveries = orders.filter(order => order.orderStatus === 'SHIPPED');
  const incomingDeliveries = orders.filter(order => order.orderStatus === 'CONFIRMED');

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
        {/* Active Deliveries */}
        <Text style={styles.sectionTitle}>Active Deliveries</Text>
        {activeDeliveries.length > 0 ? (
          activeDeliveries.map(order => (
            <View style={styles.deliveryCard} key={order._id}>
              <Text style={styles.itemTitle}>
                <Text style={styles.link}>{formatItems(order.items)}</Text>
              </Text>
              <Text style={styles.info}>
  <Text style={styles.bold}>Pickup:</Text>{' '}
  {order.merchant && order.merchant.location
    ? `${order.merchant.location.lat}, ${order.merchant.location.lng}`
    : 'N/A'}
</Text>
              <Text style={styles.info}><Text style={styles.bold}>Dropoff:</Text> {order.deliveryLocation ? `${order.deliveryLocation.lat}, ${order.deliveryLocation.lng}` : 'N/A'}</Text>
              <View style={styles.deliveryFooter}>
                <View>
                  <Text style={styles.price}>${order.totalAmount?.toFixed(2) || '0.00'}</Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => handleNavigate(order)}
                >
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
          ))
        ) : (
          <View style={styles.noDeliveryCard}>
            <Text style={styles.noDeliveryIcon}>📦</Text>
            <Text style={styles.noDeliveryTitle}>No Active Delivery</Text>
            <Text style={styles.noDeliverySubtitle}>Waiting for your next assignment.</Text>
          </View>
        )}

        {/* Incoming Deliveries */}
        {incomingDeliveries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Incoming Deliveries</Text>
            {incomingDeliveries.map(order => (
              <View style={styles.deliveryCard} key={order._id}>
                <Text style={styles.itemTitle}>
                  <Text style={styles.link}>{formatItems(order.items)}</Text>
                </Text>
               <Text style={styles.info}>
  <Text style={styles.bold}>Pickup:</Text>{' '}
  {order.merchant && order.merchant.location
    ? `${order.merchant.location.lat}, ${order.merchant.location.lng}`
    : 'N/A'}
</Text>
                <Text style={styles.info}><Text style={styles.bold}>Dropoff:</Text> {order.deliveryLocation ? `${order.deliveryLocation.lat}, ${order.deliveryLocation.lng}` : 'N/A'}</Text>
                <View style={styles.deliveryFooter}>
                  <View>
                    <Text style={styles.price}>${order.totalAmount?.toFixed(2) || '0.00'}</Text>
                  </View>
                  <View style={styles.buttons}>
                    <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(order._id)}>
                      <Text style={styles.buttonText}>✓ Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(order._id)}>
                      <Text style={styles.buttonText}>✕ Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default DSPDashboard;

// ...styles unchanged...

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