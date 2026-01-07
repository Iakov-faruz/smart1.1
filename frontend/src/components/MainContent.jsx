import React from 'react';
import ProductCard from './ProductCard';

const MainContent = ({ products, onAddToCart, admin, onProductDeleted }) => {
  if (!products) return null;

  return (
    <main className="product-grid">
      {products.map((product, index) => (
        <ProductCard 
          key={product.ProductID || `prod-${index}`} 
          product={product} 
          onAddToCart={onAddToCart} 
          isAdmin={!!admin} 
          // הוספת ה-Prop שמאפשר לכרטיס לעדכן את הרשימה ב-App לאחר המחיקה
          onDeleted={onProductDeleted} 
        />
      ))}
    </main>
  );
};

export default MainContent;