import React from 'react';
import ProductGrid from './ProductGrid';

export default function ProductShowcase({
  products = [],
  onProductSelect,
  onSaveToggle,
  savedItems = new Set(),
  onAddToCart,
  title = 'All Products',
}) {
  return (
    <section>
      
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">{title}</h2>
      <ProductGrid
        products={products}
        onProductSelect={onProductSelect}
        onSaveToggle={onSaveToggle}
        savedItems={savedItems}
        onAddToCart={onAddToCart}
      />
    </section>
  );
} 