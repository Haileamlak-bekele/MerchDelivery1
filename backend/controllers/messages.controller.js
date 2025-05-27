
const Message = require('../src/config/model/Message.model.js');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { from, to, content } = req.body;
    const message = new Message({ from, to, content });
    await message.save();
    res.status(201).json({ message: 'Message sent', data: message });
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

// Get messages between two users
const getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    const messages = await Message.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 }
      ]
    }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessages
};