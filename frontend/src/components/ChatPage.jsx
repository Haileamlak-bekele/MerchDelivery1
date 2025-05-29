import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SOCKET_URL = "http://192.168.188.100:5000";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const { merchantId, dspId } = useParams();

  // Get current user id from localStorage
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const userId = user?._id;
  console.log(userId);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join", merchantId);

    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, { ...msg }]);
      if (msg.from !== userId) {
        toast.info("New message: " + msg.content, {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [merchantId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch(
      `http://192.168.188.100:5000/messages/history?user1=${merchantId}&user2=${dspId}`
    )
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(console.error);

      

    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join", merchantId);

    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, { ...msg }]);
      if (msg.from !== userId) {
        toast.info("New message: " + msg.content, {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [merchantId, dspId, userId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg = { from: userId, to: userId === merchantId ? dspId : merchantId, content: input };

    socketRef.current.emit("sendMessage", msg);

    try {
      await fetch("http://192.168.188.100:5000/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }

    setMessages((prev) => [
      ...prev,
      { ...msg, timestamp: new Date() },
    ]);
    setInput("");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col h-[80vh] max-w-lg mx-auto bg-white rounded shadow p-4 mt-8">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBack}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition mr-2"
          >
            &larr; Back
          </button>
          <h2 className="text-xl font-bold text-indigo-700">💬 Merchant-DSP Chat</h2>
        </div>
        <div className="flex-1 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8">No messages yet. Start the conversation!</div>
          )}
          {messages.map((item, idx) => {
  const isOutgoing = item.from === userId;
  let senderLabel = "DSP";
  if (isOutgoing) {
    senderLabel = "You";
  } else if (item.from === merchantId) {
    senderLabel = "Merchant";
  }
  return (
    <div
      key={idx}
      className={`mb-2 flex ${isOutgoing ? "justify-end" : "justify-start"}`}
    >
      
      <div
        className={`p-2 rounded-lg max-w-[70%] ${
          isOutgoing
            ? "bg-indigo-500 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        <div className="text-xs font-semibold mb-1" style={{ color: isOutgoing ? "#fbbf24" : "#6366f1" }}>
          {senderLabel}
        </div>
        <div>{item.content}</div>
        <div className="text-[10px] text-blue-500 text-right mt-1">
          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ""}
        </div>
      </div>
    </div>
  );
})}

          <div ref={messagesEndRef} />
        </div>
        <div className="flex mt-2">
          <input
            className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatPage;