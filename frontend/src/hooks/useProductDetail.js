// hooks/useProductDetail.js
import { useState, useEffect } from 'react';
import { fetchProductById, fetchCommentsByProductId, addComment, fetchRelatedProducts } from '../service/product';

export const useProductDetail = (productId,userID,Name) => {
  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);

  

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const product = await fetchProductById(productId);
        console.log(product)
        setProduct(product);
        
        const productComments = await fetchCommentsByProductId(productId);
        setComments(productComments);
        
        const relatedProducts = await fetchRelatedProducts();
        setRelatedProducts(relatedProducts);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const newCommentObj = await addComment(productId, {
        userId: userID ,
        userName:Name,
        text: newComment,
        rating
      });
      setComments([...comments, newCommentObj]);
      setNewComment('');
      setRating(0);
    } catch (err) {
      setError(err);
    }
  };

  const handleQuantityChange = (value) => {
    const newValue = quantity + value;
    if (newValue >= 1 && newValue <= 10) {
      setQuantity(newValue);
    }
  };

const calculateAverageRating = () => {
    if (comments.length === 0) return 0;
    const sum = comments.reduce((acc, comment) => acc + Number(comment.rating), 0);
    return (sum / comments.length).toFixed(1);
};


  return {
    product,
    comments,
    newComment,
    relatedProducts,
    rating,
    loading,
    error,
    selectedImage,
    quantity,
    selectedVariant,
    wishlisted,
    setNewComment,
    setRating,
    setSelectedImage,
    setQuantity,
    setSelectedVariant,
    setWishlisted,
    handleCommentSubmit,
    handleQuantityChange,
    calculateAverageRating
  };
};
