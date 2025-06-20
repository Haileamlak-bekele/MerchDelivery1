const Product = require("../src/config/model/Products.model.js");
const merchant = require("../src/config/model/Merchant.model.js");
const Customer = require('../src/config/model/Customers.model.js');
const user = require("../src/config/model/Users.model.js");
const User = require("../src/config/model/Users.model.js");
const Cart = require("../src/config/model/Cart.model.js");
const Order = require("../src/config/model/Order.model.js");
const PaymentAccount = require("../src/config/model/PaymentAccount.model.js");
const PaymentAccountController = require("./paymentAccount.controller.js");


//Get all products for customers
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('merchantId', 'storeName location'); // only show necessary fields
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: err.message });
  }
};

//get product details for customers

const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate({
      path: 'merchantId',
      select: 'storeName location', // You can customize fields
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  try {
    const customerId = req.user.id; // Assume user is authenticated
    const { productId, quantity } = req.body;

    console.log('Customer ID:', customerId);
    console.log('Product ID:', productId, 'Quantity:', quantity);

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the cart item already exists for this customer and product
    let cartItem = await Cart.findOne({ customer: customerId, product: productId });
    if (cartItem) {
      // If exists, increase the quantity
      cartItem.quantity += quantity;
      await cartItem.save();
      res.status(200).json({ message: 'Product quantity updated in cart', cartItem });
    } else {
      // If not, create a new cart item
      cartItem = new Cart({ customer: customerId, product: productId, quantity });
      await cartItem.save();
      res.status(200).json({ message: 'Product added to cart', cartItem });
    }
  } catch (err) {
    console.error('Error in addToCart:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//view cart
const viewCart = async (req, res) => {
  try {
    const customerId = req.user.id;
    // Fetch all cart items for this customer, populate product details
    const cartItems = await Cart.find({ customer: customerId }).populate('product');
    res.status(200).json({ cart: cartItems });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const viewOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('items.product', 'name image price')
      .populate('customer', 'name email phoneNumber')
      .populate('items.product.merchantId', 'storeName location');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('orderId:', orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    order.orderStatus = 'CONFIRMED';

    // Ensure paymentDetails exists and set status if needed
    if (!order.paymentDetails) {
      order.paymentDetails = { amount: order.totalAmount, status: 'PENDING' };
    } else {
      order.paymentDetails.status = 'PENDING'; // or 'COMPLETED'
    }

    // Notify merchant (you can implement your notification logic here)
    order.merchantNotified = true;

    await order.save();
    res.status(200).json({ message: 'Order confirmed successfully', order });
  } catch (error) {
    console.error('Error in confirmOrder:', error); // <--- Add this for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Place an order
const placeOrder = async (req, res) => {
  try {
    const { customerId, items, deliveryLocation, paymentPrice } = req.body;
    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }
    if (!deliveryLocation) {
      return res.status(400).json({ message: 'Delivery location is required' });
    }
    if (!paymentPrice) {
      return res.status(400).json({ message: 'Payment price is required' });
    }

    // Fetch all cart items for this customer, populate product details
    const cartItems = await Cart.find({ customer: customerId }).populate('product');
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Verify if payment price matches total amount
    if (paymentPrice !== totalAmount) {
      return res.status(400).json({ 
        message: 'Payment price does not match total amount', 
        totalAmount: totalAmount,
        providedPaymentPrice: paymentPrice 
      });
    }

    // Check if stock is sufficient for all items
    for (const item of cartItems) {
      if (item.product.stock_quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${item.product.name}` });
      }
    }

    // Decrease stock for each product
    for (const item of cartItems) {
      item.product.stock_quantity -= item.quantity;
      await item.product.save();
    }

    // Fetch merchant info for each item
    const itemsWithMerchant = await Promise.all(cartItems.map(async (item) => {
      let merchantInfo = null;
      if (item.product.merchantId) {
        const merchant1 = await merchant.findById(item.product.merchantId);
        if (merchant1) {
          merchantInfo = {
            _id: merchant1._id,
            storeName: merchant1.storeName,
            location: merchant1.location,
            userId: merchant1.userId,
          };
        }
      }
      return {
        product: item.product._id,
        quantity: item.quantity,
        merchant: merchantInfo,
      };
    }));

    // Create the order
    const order = new Order({
      customer: customerId,
      items: itemsWithMerchant,
      totalAmount,
      deliveryLocation,
      paymentDetails: {
        amount: paymentPrice,
        status: 'COMPLETED',
      },
      orderStatus: 'PENDING',
    });
    await order.save();

    // CREDIT payment to merchant's account and create transaction for each merchant
    for (const item of itemsWithMerchant) {
      if (item.merchant && item.merchant.userId) {
        // Find merchant's payment account
        const merchantAccount = await PaymentAccount.findOne({ userId: item.merchant.userId, accountType: 'merchant' });
        if (merchantAccount) {
          console.log('Placing order for merchant:', item.merchant._id, 'account:', merchantAccount?._id, 'amount:', item.quantity * (cartItems.find(ci => ci.product._id.equals(item.product)).product.price));
          await PaymentAccountController.createTransaction({
            accountId: merchantAccount._id,
            amount: item.quantity * (cartItems.find(ci => ci.product._id.equals(item.product)).product.price),
            type: 'credit',
            reason: 'Order Payment',
            from: customerId,
            to: item.merchant._id,
            reference: order._id,
            referenceModel: 'Order',
          });
        }
      }
    }

    // Clear the cart
    await Cart.deleteMany({ customer: customerId });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error in placeOrder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { cartItemId } = req.params;
    console.log('Remove from cart:', { customerId, cartItemId });
    const deleted = await Cart.findOneAndDelete({ _id: cartItemId, customer: customerId });
    if (!deleted) {
      console.log('Cart item not found for:', { customerId, cartItemId });
      return res.status(404).json({ message: 'Cart item not found' });
    }
    res.status(200).json({ message: 'Cart item removed' });
  } catch (err) {
    console.error('Error in removeFromCart:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignDsp = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { dspId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.dspAssigned = dspId;

    // If the order is CONFIRMED, update status to DspAssigned
    if (order.orderStatus === 'CONFIRMED') {
      order.orderStatus = 'DspAssigned';
    }

    await order.save();

    res.status(200).json({ message: 'DSP assigned successfully', order });
  } catch (error) {
    console.error('Error in assignDsp:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//dsp accepts order reqest
const DspAcceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
   // change order status to DspAccepted
    order.orderStatus = 'DspAccepted';
    await order.save();
    res.status(200).json({ message: 'Order accepted by DSP', order });
  }
  catch (error) {
    console.error('Error in DspAcceptOrder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// DSP rejects order request
const DspRejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Change order status to DspRejected
    order.orderStatus = 'DspRejected';
    await order.save();
    res.status(200).json({ message: 'Order rejected by DSP', order });
  }
  catch (error) {
    console.error('Error in DspRejectOrder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DSP marks order as on shipping
const DspOnShipping = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Change order status to OnShipping
    order.orderStatus = 'OnShipping';
    await order.save();
    res.status(200).json({ message: 'Order marked as on shipping by DSP', order });
  }
  catch (error) {
    console.error('Error in DspOnShipping:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
//Customer changes order status to delivered
const customerOrderDelivered = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Change order status to DELIVERED
    order.orderStatus = 'DELIVERED';
    await order.save();
    res.status(200).json({ message: 'Order marked as delivered', order });
  }
  catch (error) { 
    console.error('Error in customerOrderDelivered:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//Reassign order to another Dsp
const reassignDsp = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newDspId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Reassign the DSP
    order.dspAssigned = newDspId;
    // if the order status is rejected, change it to DspAssigned
    if (order.orderStatus === 'DspRejected') {
      order.orderStatus = 'DspAssigned';
    }
    await order.save();
    res.status(200).json({ message: 'Order reassigned to new DSP successfully', order });
  }
  catch (error) {
    console.error('Error in reassignDsp:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fetch all orders for a customer
const getOrdersByCustomerId = async (req, res) => {
  try {
    // If using authentication middleware, you can use req.user.id
    // Otherwise, get from query or params
    const customerId = req.query.customerId || req.params.customerId || (req.user && req.user.id);

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    const orders = await Order.find({ customer: customerId })
      .populate('items.product', 'name price merchantId')
      .populate('items.product.merchantId', 'storeName location')
      .populate('customer', 'name email phoneNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductDetails,
  addToCart,
  viewCart,
  placeOrder,
  viewOrderDetails,
  confirmOrder,
  removeFromCart,
  assignDsp,
  getOrdersByCustomerId,
  DspAcceptOrder,
  DspRejectOrder,
  DspOnShipping,
  customerOrderDelivered,
  reassignDsp,
};