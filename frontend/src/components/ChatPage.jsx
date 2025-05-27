import React, { useEffect, useState, useRef } from "react";
import { useParams } from 'react-router-dom';
import { io } from "socket.io-client";

const SOCKET_URL = "http://192.168.188.105:5000";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Get merchantId and dspId from URL params
  const { merchantId, dspId } = useParams();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join", merchantId);

    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, { ...msg, incoming: true }]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [merchantId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { from: merchantId, to: dspId, content: input };
    socketRef.current.emit("sendMessage", msg);
    setMessages((prev) => [...prev, { ...msg, incoming: false, timestamp: new Date() }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-lg mx-auto bg-white rounded shadow p-4 mt-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-indigo-700">💬 Merchant-DSP Chat</h2>
        <span className="text-xs text-gray-500">Session only (not saved)</span>
      </div>
      <div className="bg-yellow-100 text-yellow-800 text-xs rounded px-2 py-1 mb-2">
        Messages are <b>not saved</b> to the database. Closing or refreshing this page will clear the chat history.
      </div>
      <div className="flex-1 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">No messages yet. Start the conversation!</div>
        )}
        {messages.map((item, idx) => (
          <div
            key={idx}
            className={`mb-2 flex ${item.incoming ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`p-2 rounded-lg max-w-[70%] ${
                item.incoming
                  ? "bg-gray-200 text-gray-800"
                  : "bg-indigo-500 text-white"
              }`}
            >
              <div>{item.content}</div>
              <div className="text-[10px] text-gray-500 text-right mt-1">
                {new Date(item.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex mt-2">
        <input
          className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
  );
};

export default ChatPage;