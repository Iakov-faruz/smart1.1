// import React from 'react';

// const ProductCard = ({ product }) => {
//   return (
//     <div className="product-card">
//       <div className="product-info">
//         {/* שימוש בכינוי שהגדרת בשאילתה: ProductName */}
//         <h3>{product.ProductName}</h3> 
//         <p className="price">₪{product.original_price}</p>
//         <p className="stock">במלאי: {product.stock_qty}</p>
//         {/* הוספת שם הקטגוריה לכרטיס (אופציונלי) */}
//         <small className="category-tag">{product.CategoryName}</small>
//       </div>
//       <button className="add-to-cart">הוסף לסל</button>
//     </div>
//   );
// };

// export default ProductCard;
import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="product-card">
      <div className="product-info">
        <h3>{product.ProductName}</h3> 
        <p className="price">₪{product.original_price}</p>
        <p className="stock">במלאי: {product.stock_qty}</p>
        <small className="category-tag">{product.CategoryName}</small>
      </div>
      <button className="add-to-cart" onClick={() => onAddToCart(product)}>
        הוסף לסל
      </button>
    </div>
  );
};

export default ProductCard;