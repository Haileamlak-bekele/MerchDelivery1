import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function ItemModal({ isOpen, onClose, onSave, itemData, categories }) {
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0] || '',
    price: '',
    stock: '',
    imageFile: null,
    description: '',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (itemData) {
      setFormData({
        id: itemData.id || itemData._id,
        name: itemData.name || '',
        category: itemData.category || (categories[0] || ''),
        price: itemData.price || '',
        stock: itemData.stock_quantity || '',
        imageFile: null,
        description: itemData.description || '',
      });
      if (itemData.image) {
        setPreviewImage(`${API_BASE_URL}${itemData.image}`);
      } else {
        setPreviewImage(null);
      }
    } else {
      setFormData({
        name: '',
        category: categories[0] || '',
        price: '',
        stock: '',
        imageFile: null,
        description: '',
      });
      setPreviewImage(null);
    }
    setFormErrors({});
  }, [itemData, isOpen, categories]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setFormErrors({ ...formErrors, imageFile: 'Please select an image file' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors({ ...formErrors, imageFile: 'File size must be less than 5MB' });
        return;
      }
      setFormData({ ...formData, imageFile: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setFormErrors({ ...formErrors, imageFile: null });
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || '' : value,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Product name is required.";
    if (!formData.category) errors.category = "Category is required.";
    if (formData.price === '' || formData.price < 0) errors.price = "Valid price is required.";
    if (formData.stock === '' || formData.stock < 0 || !Number.isInteger(Number(formData.stock))) errors.stock = "Valid stock quantity (integer) is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsUploading(true);
      try {
        const formDataToSend = new FormData();
        if (formData.id) formDataToSend.append('id', formData.id);
        formDataToSend.append('name', formData.name.trim());
        formDataToSend.append('description', formData.description.trim());
        formDataToSend.append('price', formData.price.toString());
        formDataToSend.append('stock_quantity', formData.stock.toString());
        formDataToSend.append('category', formData.category);
        if (formData.imageFile) {
          formDataToSend.append('image', formData.imageFile);
        }
        await onSave(formDataToSend);
        onClose();
      } catch (error) {
        console.error('Error saving product:', error);
        setFormErrors({ ...formErrors, general: error.response?.data?.message || "Failed to save item. Please try again." });
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {itemData ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text" name="name" id="name" value={formData.name} onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-50 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-900`}
            />
            {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
          </div>
          {/* Category */}
          <div>
            <label htmlFor="category" className="block mb-1 text-sm font-medium text-gray-700">Category</label>
            <select
              name="category" id="category" value={formData.category} onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-50 border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-900`}
            >
              {categories.map((cat, index) => (
                <option key={`${cat}-${index}`} value={cat}>{cat}</option>
              ))}
            </select>
            {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
          </div>
          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block mb-1 text-sm font-medium text-gray-700">Price ($)</label>
              <input
                type="number" name="price" id="price" value={formData.price} onChange={handleChange} min="0" step="0.01"
                className={`w-full px-3 py-2 bg-gray-50 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-900`}
              />
              {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
            </div>
            <div>
              <label htmlFor="stock" className="block mb-1 text-sm font-medium text-gray-700">Stock Quantity</label>
              <input
                type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} min="0" step="1"
                className={`w-full px-3 py-2 bg-gray-50 border ${formErrors.stock ? 'border-red-500' : 'border-gray-300'} rounded-md text-gray-900`}
              />
              {formErrors.stock && <p className="text-xs text-red-500 mt-1">{formErrors.stock}</p>}
            </div>
          </div>
          {/* Image Upload */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Product Image</label>
            <div className="flex items-center gap-4">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-gray-300" />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-md border border-gray-300">
                  <ImageIcon className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <label className="flex-1">
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 hover:bg-gray-200 cursor-pointer flex items-center justify-center gap-2">
                  {formData.imageFile ? 'Change Image' : 'Select Image'}
                  <Upload className="w-4 h-4" />
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            {formErrors.imageFile && <p className="text-xs text-red-500 mt-1">{formErrors.imageFile}</p>}
          </div>
          {/* Description */}
          <div>
            <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              name="description" id="description" rows="3" value={formData.description} onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900"
            ></textarea>
          </div>
          {/* General error */}
          {formErrors.general && (
            <div className="p-2 bg-red-100 border border-red-400 rounded-md text-sm text-red-700">
              {formErrors.general}
            </div>
          )}
          {/* Footer Buttons */}
          <div className="flex justify-end items-center pt-4 border-t border-gray-200 mt-2 space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isUploading}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 min-w-24"
            >
              {isUploading ? (<><Loader2 className="w-4 h-4 animate-spin" />Saving...</>) : (itemData ? 'Save Changes' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
