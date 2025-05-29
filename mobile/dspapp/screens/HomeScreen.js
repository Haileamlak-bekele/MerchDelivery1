import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavbar from '../components/buttomNav';
import LocationTracker from '../components/locationTracker';
import { io } from 'socket.io-client';
import Toast from 'react-native-toast-message';


const SOCKET_URL = 'http://192.168.4.182:5000';

const DSPDashboard = () => {

   const socketRef = useRef(null);
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dspId, setDspId] = useState(null);

 useEffect(() => {
    AsyncStorage.getItem('userId').then(id => {
      setDspId(id);
    });
  }, []);
 

   // Connect socket and listen for messages after dspId is loaded
  useEffect(() => {
    if (!dspId) return;
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('join', dspId);
    // Alert.alert('Connected to chat server',dspId);

  socketRef.current.on('receiveMessage', (msg) => {
  console.log('Received message:', msg, 'dspId:', dspId);
  Toast.show({
        type: 'info',
        text1: 'New message',
        text2: msg.content,
        position: 'bottom',
        visibilityTime: 2000,
      });
});

    return () => {
      socketRef.current.disconnect();
    };
  }, [dspId]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch('http://192.168.4.182:5000/dsp/orders', {
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

  // Calculate distance between two points using Haversine formula (in kilometers)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 'N/A';
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2) + ' km';
  };

  const handleAccept = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://192.168.4.182:5000/orders/${orderId}/dsp-accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus: 'DspAccepted' }),
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId
              ? { ...order, orderStatus: 'DspAccepted' }
              : order
          )
        );
      } else {
        console.error('Failed to update order status to DspAccepted');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleReject = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://192.168.4.182:5000/orders/${orderId}/dsp-reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus: 'DspRejected' }),
      });
      if (res.ok) {
        setOrders(prev => prev.filter(order => order._id !== orderId));
      } else {
        console.error('Failed to update order status to DspRejected');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // New function to handle delivery completion
  const handleCompleteDelivery = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://192.168.4.182:5000/orders/${orderId}/delivered`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus: 'DELIVERED' }),
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId
              ? { ...order, orderStatus: 'DELIVERED' }
              : order
          )
        );
      } else {
        console.error('Failed to update order status to DELIVERED');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
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
    });
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const formatItems = (items) => {
    if (!items) return '';
    return items.map(i => `${i.product?.name || 'Item'} x${i.quantity}`).join(', ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Filter active deliveries (DspAccepted or SHIPPED, exclude DELIVERED)
  const activeDeliveries = orders.filter(
    order => order.orderStatus === 'DspAccepted' || order.orderStatus === 'OnShipping'
  );
  // Filter incoming deliveries
  const incomingDeliveries = orders.filter(
    order => order.orderStatus === 'DspAssigned' || order.orderStatus === 'PENDING'
  );
  // Check if there is an active order
  const hasActiveOrder = activeDeliveries.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🚚 DSP Dashboard</Text>
        <View style={styles.profileIcon}>
          <Text style={styles.profileText}>👤</Text>
        </View>
      </View>
 {/* <TouchableOpacity onPress={() => Toast.show({ type: 'success', text1: 'Test Toast', position: 'bottom' })}>
        <Text>Show Test Toast</Text>
      </TouchableOpacity> */}

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
              <Text style={styles.info}>
                <Text style={styles.bold}>Dropoff:</Text>{' '}
                {order.deliveryLocation ? `${order.deliveryLocation.lat}, ${order.deliveryLocation.lng}` : 'N/A'}
              </Text>
              <Text style={styles.info}>
                <Text style={styles.bold}>Distance:</Text>{' '}
                {order.merchant?.location && order.deliveryLocation
                  ? calculateDistance(
                      order.merchant.location.lat,
                      order.merchant.location.lng,
                      order.deliveryLocation.lat,
                      order.deliveryLocation.lng
                    )
                  : 'N/A'}
              </Text>
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
                <TouchableOpacity
                  style={styles.chatButton}
                  onPress={() => navigation.navigate('Chat',{ merchantId: order.items[0].product?.merchantId, dspId: order.dspAssigned })}
                >
                  <Text style={styles.buttonText}>💬 Chat</Text>
                </TouchableOpacity>
               {order.orderStatus !== 'OnShipping' && <TouchableOpacity
  style={styles.confirmButton}
  onPress={async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://192.168.4.182:5000/orders/${order._id}/dsp-on-shipping`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus: 'OnShipping' }),
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(o =>
            o._id === order._id
              ? { ...o, orderStatus: 'OnShipping' }
              : o
          )
        );
      } else {
        console.error('Failed to update order status to SHIPPING');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  }}
>
  <Text style={styles.buttonText}>✔ Confirm Pickup</Text>
</TouchableOpacity>}
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleCompleteDelivery(order._id)}
                >
                  <Text style={styles.buttonText}>✔ Complete Delivery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => handleViewDetails(order)}
                >
                  <Text style={styles.buttonText}> Details</Text>
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
                <Text style={styles.info}>
                  <Text style={styles.bold}>Dropoff:</Text>{' '}
                  {order.deliveryLocation ? `${order.deliveryLocation.lat}, ${order.deliveryLocation.lng}` : 'N/A'}
                </Text>
                <Text style={styles.info}>
                  <Text style={styles.bold}>Distance:</Text>{' '}
                  {order.merchant?.location && order.deliveryLocation
                    ? calculateDistance(
                        order.merchant.location.lat,
                        order.merchant.location.lng,
                        order.deliveryLocation.lat,
                        order.deliveryLocation.lng
                      )
                    : 'N/A'}
                </Text>
                <View style={styles.deliveryFooter}>
                  <View>
                    <Text style={styles.price}>${order.totalAmount?.toFixed(2) || '0.00'}</Text>
                  </View>
                  <View style={styles.buttons}>
                    {!hasActiveOrder ? (
                      <>
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => handleAccept(order._id)}
                        >
                          <Text style={styles.buttonText}>✓ Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rejectButton}
                          onPress={() => handleReject(order._id)}
                        >
                          <Text style={styles.buttonText}>✕ Reject</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={styles.disabledText}>Cannot accept new orders while an active delivery is in progress.</Text>
                    )}
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => handleViewDetails(order)}
                    >
                      <Text style={styles.buttonText}> Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order Details</Text>
            {selectedOrder && (
              <>
                <Text style={styles.modalInfo}>
                  <Text style={styles.bold}>Order ID:</Text> {selectedOrder._id}
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.bold}>Items:</Text> {formatItems(selectedOrder.items)}
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.bold}>Total Amount:</Text> ${selectedOrder.totalAmount?.toFixed(2) || '0.00'}
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.bold}>Status:</Text> {selectedOrder.orderStatus}
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.bold}>Customer:</Text> {selectedOrder.customer?.name || 'N/A'}
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.bold}>Customer Phone:</Text> {selectedOrder.customer?.phoneNumber || 'N/A'}
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.bold}>Pickup:</Text>{' '}
                  {selectedOrder.merchant && selectedOrder.merchant.location
                    ? `${selectedOrder.merchant.location.lat}, ${selectedOrder.merchant.location.lng}`
                    : 'N/A'}
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.bold}>Dropoff:</Text>{' '}
                  {selectedOrder.deliveryLocation
                    ? `${selectedOrder.deliveryLocation.lat}, ${selectedOrder.deliveryLocation.lng}`
                    : 'N/A'}
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.bold}>Distance:</Text>{' '}
                  {selectedOrder.merchant?.location && selectedOrder.deliveryLocation
                    ? calculateDistance(
                        selectedOrder.merchant.location.lat,
                        selectedOrder.merchant.location.lng,
                        selectedOrder.deliveryLocation.lat,
                        selectedOrder.deliveryLocation.lng
                      )
                    : 'N/A'}
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.bold}>Dropoff Address:</Text>{' '}
                  {selectedOrder.deliveryLocation?.address || 'N/A'}
                </Text>
                <Text style={styles.modalInfo}>
                  <Text style={styles.bold}>Created At:</Text> {formatDate(selectedOrder.createdAt)}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* <LocationTracker /> */}
      <BottomNavbar />
      <Toast />
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
  detailsButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalInfo: {
    fontSize: 14,
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: '#7f8c8d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 8,
  },
});