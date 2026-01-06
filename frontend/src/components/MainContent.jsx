// import React from 'react';
// import ProductCard from './ProductCard';

// const MainContent = ({ products }) => {
//   return (
//     <main className="product-grid">
//       {products.map((product) => (
//         /* הוספת ה-key כאן היא הפתרון לשגיאה */
//         /* השתמש ב-ProductID כפי שהגדרנו בשאילתת ה-SQL */
//         <ProductCard key={product.ProductID || product.ProductName} product={product} />
//       ))}
//     </main>
//   );
// };

// export default MainContent;
import React from 'react';
import ProductCard from './ProductCard';

const MainContent = ({ products, onAddToCart }) => {
  if (!products) return null;

  return (
    <main className="product-grid">
      {products.map((product, index) => (
        <ProductCard 
          // משתמשים ב-ID, ואם הוא חסר - באינדקס של הרשימה כגיבוי
          key={product.ProductID || `prod-${index}`} 
          product={product} 
          onAddToCart={onAddToCart} 
        />
      ))}
    </main>
  );
};
export default MainContent;