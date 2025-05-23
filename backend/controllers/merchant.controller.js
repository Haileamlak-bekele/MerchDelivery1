const Order = require("../src/config/model/Order.model.js");
const Product = require("../src/config/model/Products.model.js");
const Merchant = require("../src/config/model/Merchant.model.js");

// View all orders for a merchant
const viewAllOrders = async (req, res) => {
    try {
        // Find the merchant document for this user
        const merchant = await Merchant.findOne({ userId: req.user.id });
        if (!merchant) {
            return res.status(404).json({ success: false, message: "Merchant not found" });
        }
        const merchantId = merchant._id;

        // Find all products belonging to this merchant
        const merchantProducts = await Product.find({ merchantId });

        // Get all orders that contain any of the merchant's products
        const orders = await Order.find({
            'items.product': { $in: merchantProducts.map(product => product._id) }
        })
        .populate('customer', 'name email phoneNumber')
        .populate('items.product', 'name price merchantId')
        .populate('dspAssigned', 'name email phoneNumber')
        .populate('items.product.merchantId', 'storeName location');

        // Filter orders to only include items from this merchant
        const merchantOrders = orders.map(order => ({
            ...order.toObject(),
            items: order.items.filter(item => 
                item.product.merchantId._id.toString() === merchantId.toString()
            )
        })).filter(order => order.items.length > 0);

        res.status(200).json({
            success: true,
            orders: merchantOrders
        });
    } catch (error) {
        console.error('Error fetching merchant orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

module.exports = {
    viewAllOrders
}; 