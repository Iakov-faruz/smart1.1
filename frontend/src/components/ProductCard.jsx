
// import React from 'react';

// const ProductCard = ({ product, onAddToCart }) => {
//   return (
//     <div className="product-card">
//       <div className="product-info">
//         <h3>{product.ProductName}</h3> 
//         <p className="price">₪{product.original_price}</p>
//         <p className="stock">במלאי: {product.stock_qty}</p>
//         <small className="category-tag">{product.CategoryName}</small>
//       </div>
//       <button className="add-to-cart" onClick={() => onAddToCart(product)}>
//         הוסף לסל
//       </button>
//     </div>
//   );
// };

// export default ProductCard;
import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  // בדיקה האם המוצר במלאי
  const isOutOfStock = product.stock_qty <= 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="product-info">
        <h3>{product.ProductName}</h3> 
        <p className="price">₪{product.original_price}</p>
        <p className={`stock ${isOutOfStock ? 'no-stock' : ''}`}>
          {isOutOfStock ? 'אזל מהמלאי' : `במלאי: ${product.stock_qty}`}
        </p>
        <small className="category-tag">{product.CategoryName}</small>
      </div>
      
      <button 
        className="add-to-cart" 
        onClick={() => !isOutOfStock && onAddToCart(product)}
        disabled={isOutOfStock}
      >
        {isOutOfStock ? 'לא זמין' : 'הוסף לסל'}
      </button>
    </div>
  );
};

export default ProductCard;