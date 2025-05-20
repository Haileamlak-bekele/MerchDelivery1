import { useState, useMemo } from 'react';
import { useCustomerShop } from './useCustomerShop';
import axios from 'axios';

// Helper to get current user from localStorage
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export function useCheckout() {
  const { cart, placeOrder, loading, error } = useCustomerShop();
  const [formData, setFormData] = useState({
    deliveryLocation: '',
    payPrice: '',
  });
  const [errors, setErrors] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Cart items for summary
  const cartItems = cart.map(item => ({
    id: item._id,
    name: item.product?.name || 'Product',
    quantity: item.quantity,
    price: item.product?.price || 0,
    image: item.product?.image || '',
    productId: item.product?._id,
  }));

  const subtotal = useMemo(() =>
    cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );
  const taxes = useMemo(() => subtotal * 0.08, [subtotal]);
  const total = useMemo(() => subtotal + taxes, [subtotal, taxes]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
    }
  };

  // // Validation
  // const validateForm = () => {
  //   const newErrors = {};
  //   // Delivery location required
  //   if (!formData.deliveryLocation || !formData.deliveryLocation.trim()) {
  //     newErrors.deliveryLocation = 'Delivery location is required.';
  //   }
  //   // payPrice required, must be a number, must be >= total
  //   if (!formData.payPrice || formData.payPrice === '') {
  //     newErrors.payPrice = 'Payment amount is required.';
  //   } else if (isNaN(Number(formData.payPrice))) {
  //     newErrors.payPrice = 'Payment amount must be a number.';
  //   } else if (Number(formData.payPrice) < total) {
  //     newErrors.payPrice = `Payment amount must be at least $${total.toFixed(2)}.`;
  //   }
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  // Order submission
 const handleSubmitOrder = async (e) => {
  if (e && e.preventDefault) e.preventDefault();
  setOrderError(null);
  setOrderSuccess(false);

  const user = getCurrentUser();
  const customerId = user?._id;
  if (!customerId) {
    setOrderError('User not found. Please log in again.');
    return;
  }

  // Validate deliveryLocation is an object with lat/lng
  const deliveryLocation = formData.deliveryLocation;
  if (
    !deliveryLocation ||
    typeof deliveryLocation.lat !== 'number' ||
    typeof deliveryLocation.lng !== 'number'
  ) {
    setOrderError('Please pick a valid delivery location on the map.');
    return;
  }

  // Validate paymentPrice
  const paymentPrice = Number(formData.payPrice);
  if (isNaN(paymentPrice) || paymentPrice <= 0) {
    setOrderError('Please enter a valid payment amount.');
    return;
  }

  const orderItems = cart.map(item => ({
    product: item.product._id,
    quantity: item.quantity,
  }));

  const token = localStorage.getItem('authToken');
  try {
    await placeOrder(
      { customerId, items: orderItems, deliveryLocation, paymentPrice },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    setOrderSuccess(true);
  } catch (err) {
    setOrderError(err?.response?.data?.message || 'Order failed');
  }
};

  console.log('cartItems in useCheckout:', cartItems);

  return {
    formData,
    setFormData,
    handleInputChange,
    handleSubmitOrder,
    cartItems,
    subtotal,
    taxes,
    total,
    loading,
    error,
    orderSuccess,
    orderError,
    errors,
  };
} 