import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export function useMerchantChat(merchantId) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all conversations for this merchant
  useEffect(() => {
  if (!merchantId) return;
  console.log(`Fetching conversations for merchant ${merchantId}`);
  fetch(`${API_BASE_URL}/messages/conversations?merchantId=${merchantId}`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setConversations(data);
        console.log('Fetched conversations:', data);
      } else {
        setConversations([]);
        console.error('Error fetching conversations:', data);
      }
    })
    .catch(err => {
      setConversations([]);
      console.error('Network error fetching conversations:', err);
    });
}, [merchantId]);

  // Fetch messages for selected conversation
  const fetchMessages = async (customerId, productId) => {
    setLoading(true);
    const res = await fetch(
      `${API_BASE_URL}/messages/history?user1=${merchantId}&user2=${customerId}&productId=${productId}`
    );
    const data = await res.json();
    setMessages(data);
    setLoading(false);
  };

  // Send a message
  const sendMessage = async ({ to, content, productId }) => {
    const res = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: merchantId,
        to,
        content,
        productId,
      }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, data.data]);
  };

  return {
    conversations,
    selected,
    setSelected,
    messages,
    fetchMessages,
    sendMessage,
    loading,
  };
}