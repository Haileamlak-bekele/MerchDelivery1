const Message = require('../src/config/model/Message.model.js');
const User = require('../src/config/model/Users.model.js');
const Product = require('../src/config/model/Products.model.js');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { from, to, content, productId } = req.body;
    const messageData = productId
      ? { from, to, content, productId }
      : { from, to, content };
    const message = new Message(messageData);
    await message.save();
    res.status(201).json({ message: 'Message sent', data: message });
  } catch (err) {
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

// Get messages between two users (optionally filtered by productId)
const getMessages = async (req, res) => {
  try {
    const { user1, user2, productId } = req.query;
    let query = {
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 }
      ]
    };
    if (productId) {
      query.productId = productId;
    }
    // Populate user and product info for each message
    const messages = await Message.find(query)
      .sort({ timestamp: 1 })
      .populate('from', 'name')
      .populate('to', 'name')
      .populate('productId', 'name');
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
};

// Get all conversations for a merchant (grouped by customer and product)
const mongoose = require('mongoose');

const getMerchantConversations = async (req, res) => {
  try {
    const { merchantId } = req.query;
    if (!merchantId) return res.status(400).json({ message: 'merchantId required' });
    const merchantObjectId = new mongoose.Types.ObjectId(merchantId);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { to: merchantObjectId },
            { from: merchantObjectId }
          ]
        }
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            customerId: { $cond: [{ $eq: ["$from", merchantObjectId] }, "$to", "$from"] },
            productId: "$productId"
          },
          lastMessage: { $first: "$content" },
          lastTimestamp: { $first: "$timestamp" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.customerId",
          foreignField: "_id",
          as: "customer"
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$customer" },
      { $unwind: "$product" },
      {
        $project: {
          customerId: "$_id.customerId",
          customerName: "$customer.name",
          productId: "$_id.productId",
          productName: "$product.name",
          lastMessage: 1,
          lastTimestamp: 1
        }
      },
      { $sort: { lastTimestamp: -1 } }
    ]);
    console.log("conversation", conversations);

    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching conversations', error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getMerchantConversations
};