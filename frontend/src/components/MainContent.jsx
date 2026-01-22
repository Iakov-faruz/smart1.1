import React from 'react';
import ProductCard from './ProductCard';

const MainContent = ({ products, onAddToCart, admin, onProductDeleted, onEditProduct }) => {
  if (!products || products.length === 0) {
    return (
      <div className="no-products">
        <p>לא נמצאו מוצרים להצגה בקטגוריה זו.</p>
      </div>
    );
  }

  return (
    <main className="product-grid">
      {products.map((product, index) => (
        <ProductCard 
          key={product.ProductID || product.id || index} 
          product={product} 
          onAddToCart={onAddToCart} 
          isAdmin={!!admin} // המרת הערך לבוליאני (true/false)
          onDeleted={onProductDeleted}
          onEdit={() => onEditProduct && onEditProduct(product)} 
        />
      ))}
    </main>
  );
};

export default MainContent;