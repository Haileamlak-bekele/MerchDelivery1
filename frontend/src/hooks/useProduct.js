import { useState, useEffect, useMemo } from 'react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../service/productService';
import { API_BASE_URL } from '../config';

export const useProduct = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct,setSelectedProduct] = useState(null)

  // Fetch products function (so you can call it after add/update)
  const fetchAndSetProducts = async () => {
    try {
      setIsLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products on mount
  useEffect(() => {
    fetchAndSetProducts();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const unique = new Set(products.map(p => p.category));
    return ['All', ...unique];
  }, [products]);

  // Filtering logic
  useEffect(() => {
    let temp = [...products];
    if (activeCategory && activeCategory !== 'All') {
      temp = temp.filter(p => p.category === activeCategory);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      temp = temp.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        (p.category && p.category.toLowerCase().includes(lower)) ||
        (p.description && p.description.toLowerCase().includes(lower))
      );
    }
    setFilteredProducts(temp);
  }, [products, searchTerm, activeCategory]);

  // CRUD operations
  const handleAddProduct = async (formData) => {
    try {
      console.log('Form data being sent:', {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock_quantity: formData.stock,
        category: formData.category,
        hasImage: !!formData.imageFile
      });
      await createProduct(formData);
      await fetchAndSetProducts(); // Fetch latest after add
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to add product. Please try again.');
    }
  };

  const handleEditProduct = async (formData) => {
    try {
      await updateProduct(formData.get('id'), formData);
      await fetchAndSetProducts(); // Fetch latest after update
      setIsModalOpen(false);
      setCurrentProduct(null);
    } catch (err) {
      setError('Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(prevProducts => prevProducts.filter(p => p._id !== id));
        setFilteredProducts(prevFiltered => prevFiltered.filter(p => p._id !== id));
        setError(null);
      } catch (err) {
        setError('Failed to delete product. Please try again.');
        console.error('Delete error:', err);
      }
    }
  };

  // Stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length;
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;

  return {
    products,
    filteredProducts,
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    isModalOpen,
    setIsModalOpen,
    currentProduct,
    setCurrentProduct,
    isLoading,
    error,
    setError,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    categories,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    API_BASE_URL,
  };
}; 