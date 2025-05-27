import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'http://192.168.188.105:5000'; // Your backend IP

const DspMerchantChatScreen = ({ route }) => {
  const { merchantId, dspId } = route.params; // Pass these from navigation
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect and join room
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.emit('join', dspId);

    // Listen for incoming messages
    socketRef.current.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, { ...msg, incoming: true }]);
    });

    // Optionally: fetch chat history from your REST API here

    return () => {
      socketRef.current.disconnect();
    };
  }, [dspId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { from: dspId, to: merchantId, content: input };
    socketRef.current.emit('sendMessage', msg);
    setMessages((prev) => [...prev, { ...msg, incoming: false, timestamp: new Date() }]);
    setInput('');
  };

  const renderItem = ({ item }) => (
    <View style={[styles.message, item.incoming ? styles.incoming : styles.outgoing]}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );

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
  incoming: { backgroundColor: '#e5e7eb', alignSelf: 'flex-start' },
  outgoing: { backgroundColor: '#10b981', alignSelf: 'flex-end' },
  messageText: { color: '#222' },
  timestamp: { fontSize: 10, color: '#888', marginTop: 2, alignSelf: 'flex-end' },
});