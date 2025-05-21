import React, { useState, useEffect } from 'react';
import { getDeliveryPricing, updateDeliveryPricing } from '../service/Service'; // Adjust the import path as needed

function DeliveryPriceSection() {
  const [deliveryPrices, setDeliveryPrices] = useState({
    basePrice: 0,
    perKm: 0,
    perKg: 0,
  });

  useEffect(() => {
    const fetchDeliveryPricing = async () => {
      try {
        const response = await getDeliveryPricing();
        setDeliveryPrices({ // Example logic, adjust as needed
          basePrice: response.basePrice, // Example logic, adjust as needed
          perKm: response.perKmRate,
          perKg: response.perKgRate,
        });
      } catch (error) {
        console.error('Failed to fetch delivery prices:', error);
      }
    };

    fetchDeliveryPricing();
  }, []);

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setDeliveryPrices({
      ...deliveryPrices,
      [name]: parseFloat(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateDeliveryPricing(
        deliveryPrices.basePrice,
        deliveryPrices.perKm,
        deliveryPrices.perKg
      );
      console.log('Delivery prices updated:', response);
      alert('Delivery prices updated successfully!');
    } catch (error) {
      console.error('Failed to update delivery prices:', error);
      alert('Failed to update delivery prices.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Set Delivery Prices</h2>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="standard" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Base Price
            </label>
            <input
              type="number"
              name="standard"
              id="standard"
              value={deliveryPrices.basePrice}
              onChange={handlePriceChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="perKm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price per Kilometer
            </label>
            <input
              type="number"
              name="perKm"
              id="perKm"
              value={deliveryPrices.perKm}
              onChange={handlePriceChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="perKg" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price per Kilogram
            </label>
            <input
              type="number"
              name="perKg"
              id="perKg"
              value={deliveryPrices.perKg}
              onChange={handlePriceChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
          >
            Save Prices
          </button>
        </div>
      </form>
    </div>
  );
}

export default DeliveryPriceSection;
