import React, { useEffect, useState } from 'react';
import { useMerchantChat } from '../hooks/useMerchantChat';

const MerchantChatPage = () => {
  const merchant = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const merchantId = merchant?._id;
  const {
    conversations,
    selected,
    setSelected,
    messages,
    fetchMessages,
    sendMessage,
    loading,
  } = useMerchantChat(merchantId);

  const [chatInput, setChatInput] = useState('');

  // When a conversation is selected, fetch its messages
  useEffect(() => {
    if (selected) {
      fetchMessages(selected.customerId, selected.productId);
    }
    // eslint-disable-next-line
  }, [selected]);

  const handleSend = () => {
    if (!chatInput.trim() || !selected) return;
    sendMessage({
      to: selected.customerId,
      content: chatInput,
      productId: selected.productId,
    });
    setChatInput('');
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col md:flex-row h-[80vh] bg-gradient-to-br from-indigo-100 via-emerald-100 to-blue-100 rounded shadow overflow-hidden">
      {/* Chat List */}
      <aside className="w-full md:w-1/3 border-b md:border-b-0 md:border-r p-4 overflow-y-auto bg-gradient-to-b from-indigo-200 to-emerald-100">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBack}
            className="mr-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            &larr; Back
          </button>
          <h2 className="font-bold text-lg text-indigo-900">Chats</h2>
        </div>
        <ul>
          {Array.isArray(conversations) && conversations.length === 0 && (
            <li className="text-gray-500">No conversations yet.</li>
          )}
          {Array.isArray(conversations) &&
            conversations.map((conv, idx) => (
              <li
                key={idx}
                className={`p-3 rounded cursor-pointer mb-2 transition ${
                  selected &&
                  selected.customerId === conv.customerId &&
                  selected.productId === conv.productId
                    ? 'bg-indigo-700 text-white font-semibold'
                    : 'hover:bg-indigo-200 bg-white text-gray-900'
                }`}
                onClick={() =>
                  setSelected({
                    customerId: conv.customerId,
                    productId: conv.productId,
                    customerName: conv.customerName,
                    productName: conv.productName,
                  })
                }
              >
                <div className="font-semibold">{conv.customerName}</div>
                <div className="text-xs text-indigo-700">{conv.productName}</div>
                <div className="text-xs text-gray-600 truncate">{conv.lastMessage}</div>
              </li>
            ))}
          {!Array.isArray(conversations) && (
            <li className="text-red-500">Error loading conversations</li>
          )}
        </ul>
      </aside>
      {/* Chat Window */}
      <main className="flex-1 flex flex-col bg-gradient-to-b from-blue-50 to-emerald-50">
        <div className="border-b p-4 font-bold bg-indigo-700 text-white">
          {selected ? (
            <>
              Chat with <span className="text-yellow-200">{selected.customerName}</span> about{' '}
              <span className="text-emerald-200">{selected.productName}</span>
            </>
          ) : (
            'Select a conversation'
          )}
        </div>
        // ...existing code...
<div className="flex-1 overflow-y-auto p-4 space-y-2">
  {loading && <div className="text-center text-gray-500">Loading...</div>}
  {!loading && selected && messages.length === 0 && (
    <div className="text-center text-gray-400 mt-10">No messages yet.</div>
  )}
  {selected &&
    messages.map((msg) => (
      <div
        key={msg._id}
        className={`flex ${msg.from === merchantId ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`rounded-lg px-4 py-2 max-w-xs break-words shadow ${
            msg.from === merchantId
              ? 'bg-indigo-600 text-white ml-auto'
              : 'bg-emerald-200 text-gray-900 mr-auto'
          }`}
        >
          <div className="text-sm">{msg.content}</div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    ))}
</div>
// ...existing code...
        {selected && (
          <div className="p-4 border-t flex gap-2 bg-indigo-100">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 border rounded px-3 py-2 focus:outline-none bg-white text-black"
              placeholder="Type your message..."
              autoFocus
            />
            <button
              onClick={handleSend}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MerchantChatPage;