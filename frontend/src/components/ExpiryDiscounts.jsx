import React from 'react';
import '../styles/ExpiryDiscounts.css';

const ExpiryDiscounts = ({ products }) => {
  // סינון מוצרים עם הנחה
  const discountedProducts = products.filter(p => p.discountPercent > 0);

  if (discountedProducts.length === 0) return null;

  return (
    <div className="expiry-discounts-bar">
      <div className="marquee-container">
        {/* ה-content הוא השיירה עצמה */}
        <div className="marquee-content">
          {discountedProducts.map((product, index) => (
            <div className="discount-item" key={`promo-${product.ProductID || index}`}>
              <span className="badge">מבצע תוקף קצר!</span>
              <span className="product-name">{product.name}</span>
              <span className="old-price">₪{product.original_price}</span>
              <span className="new-price">₪{product.finalPrice}</span>
              <span className="discount-tag">{product.discountPercent}% הנחה</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpiryDiscounts;