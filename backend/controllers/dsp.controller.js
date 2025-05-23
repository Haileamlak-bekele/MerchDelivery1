const DspLocation = require('../src/config/model/DspLocation.model.js');
const Order = require('../src/config/model/Order.model');
const Merchant = require('../src/config/model/Merchant.model'); // adjust path as needed

/**
 * Update or create the latest location for a DSP.
 * Each DSP has one document in the DspLocation collection, identified by userId.
 */
const updateLocation = async (req, res) => {
  const { latitude, longitude } = req.body;

  try {
    // Retrieve userId from the authenticated user (set by auth middleware)
    const userId = req.user.id;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Latitude and longitude are required and must be numbers' });
    }

    // Update or create the DSP location document for this user
    const updated = await DspLocation.findOneAndUpdate(
      { userId },
      { latitude, longitude, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Location updated', location: updated });
  } catch (err) {
    console.error('Location update error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};




const getDspOrders = async (req, res) => {
  try {
    const dspId = req.user.id;
    const orders = await Order.find({ dspAssigned: dspId })
      .populate('customer')
      .populate('items.product');

    // For each order, fetch the merchant location using merchantId from the first product
    const ordersWithMerchantLocation = await Promise.all(
      orders.map(async (order) => {
        let merchantLocation = null;
        let merchantName = null;
        if (
          order.items &&
          order.items.length > 0 &&
          order.items[0].product &&
          order.items[0].product.merchantId
        ) {
          const merchant = await Merchant.findById(order.items[0].product.merchantId);
          if (merchant) {
            merchantLocation = merchant.location;
            merchantName = merchant.name;
          }
        }
        console.log("merchant location:" ,merchantLocation);
        // Attach merchant location and name to the order object
        return {
          ...order.toObject(),
          merchant: {
            location: merchantLocation,
            name: merchantName,
            _id: order.items[0].product.merchantId,
          },
        };
      })
    );

    res.json({ orders: ordersWithMerchantLocation });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



module.exports = {
  updateLocation,
  getDspOrders
};