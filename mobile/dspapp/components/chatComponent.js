import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { io } from 'socket.io-client';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'http://192.168.4.182:5000';

const DspMerchantChatScreen = ({ route }) => {
  const { merchantId, dspId } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState(null);
  const socketRef = useRef(null);

  // Get userId from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => {
      setUserId(id);
    });
  }, []);

  // Fetch chat history from backend
  useEffect(() => {
    fetch(
      `http://192.168.4.182:5000/messages/history?user1=${dspId}&user2=${merchantId}`
    )
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(console.error);
  }, [dspId, merchantId]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('join', dspId);

    socketRef.current.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, { ...msg }]);
      // Show toast notification for new incoming message
      if (userId && msg.from !== userId) {
        Toast.show('New message: ' + msg.content, {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
        });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [dspId, userId]);

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;
    const msg = { from: userId, to: userId === dspId ? merchantId : dspId, content: input };
console.log("hi",userId,dspId);
    // 1. Emit via socket for real-time chat
    socketRef.current.emit('sendMessage', msg);

    // 2. Store in the database via REST API
    try {
      await fetch('http://192.168.4.182:5000/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
    } catch (err) {
      console.error('Failed to save message:', err);
    }

    setMessages((prev) => [
      ...prev,
      { ...msg, timestamp: new Date() },
    ]);
    setInput('');
  };

  const renderItem = ({ item }) => {
    // Outgoing if sent by this user, incoming otherwise
    const isOutgoing = item.from?._j === userId;
    console.log("hi",item.from);
    let senderLabel = isOutgoing ? 'You (DSP)' : (item.from === merchantId ? 'Merchant' : 'DSP');
    return (
      <View style={{ marginBottom: 2 }}>
        <Text style={{
          fontSize: 12,
          color: isOutgoing ? '#059669' : '#6366f1',
          alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
          marginBottom: 2,
          fontWeight: 'bold'
        }}>
          {senderLabel}
        </Text>
        <View
          style={[
            styles.message,
            isOutgoing ? styles.outgoing : styles.incoming,
            { alignSelf: isOutgoing ? 'flex-end' : 'flex-start' }
          ]}
        >
          <Text style={[styles.messageText, isOutgoing ? { color: '#fff' } : { color: '#222' }]}>
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DspMerchantChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, padding: 10, backgroundColor: '#fff' },
  sendButton: { backgroundColor: '#10b981', padding: 12, borderRadius: 20, marginLeft: 8 },
  message: { marginVertical: 4, padding: 10, borderRadius: 10, maxWidth: '80%' },
  incoming: { backgroundColor: '#e5e7eb', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#d1d5db' },
  outgoing: { backgroundColor: '#10b981', alignSelf: 'flex-end', borderWidth: 1, borderColor: '#059669' },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 10, color: '#888', marginTop: 2, alignSelf: 'flex-end' },
});